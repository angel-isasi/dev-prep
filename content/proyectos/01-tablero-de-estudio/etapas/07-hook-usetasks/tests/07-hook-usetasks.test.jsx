// @vitest-environment jsdom
import { beforeEach, expect, test } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import codigoApp from "../src/App.jsx?raw"; // el código fuente de App.jsx como texto
import { failNextRequest, getTasks, resetDatabase } from "../src/api.js";
import { useTasks } from "../src/hooks/useTasks.js";

const TAREAS = [
  { id: 1, title: "Repasar closures", topic: "JavaScript", done: false },
  { id: 2, title: "Leer sobre useState", topic: "React", done: true },
];

beforeEach(() => {
  resetDatabase(TAREAS);
  localStorage.clear();
});

async function hookCargado() {
  const hook = renderHook(() => useTasks());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook.result;
}

test("empieza cargando y luego trae las tareas de la API", async () => {
  const { result } = renderHook(() => useTasks());
  expect(result.current.loading).toBe(true);
  expect(result.current.tasks).toEqual([]);

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.tasks).toEqual(TAREAS);
  expect(result.current.error).toBeNull();
});

test("si la carga falla deja el mensaje en error, y reload lo recupera", async () => {
  failNextRequest();
  const result = await hookCargado();
  expect(result.current.error).toBe("No se pudieron cargar las tareas.");
  expect(result.current.tasks).toEqual([]);

  await act(() => result.current.reload());
  expect(result.current.error).toBeNull();
  expect(result.current.tasks).toHaveLength(2);
});

test("addTask crea en el servidor, agrega al estado y devuelve la tarea creada", async () => {
  const result = await hookCargado();
  let creada;
  await act(async () => {
    creada = await result.current.addTask({ title: "Practicar fetch", topic: "JavaScript" });
  });
  expect(creada).toMatchObject({ title: "Practicar fetch", topic: "JavaScript", done: false });
  expect(result.current.tasks.at(-1)).toEqual(creada);
  expect((await getTasks()).some((t) => t.id === creada.id)).toBe(true);
});

test("toggleTask cambia done en el estado y en el servidor", async () => {
  const result = await hookCargado();
  await act(() => result.current.toggleTask(1));
  expect(result.current.tasks.find((t) => t.id === 1).done).toBe(true);
  expect((await getTasks()).find((t) => t.id === 1).done).toBe(true);
});

test("renameTask cambia el título en el estado y en el servidor", async () => {
  const result = await hookCargado();
  await act(() => result.current.renameTask(2, "Leer sobre useReducer"));
  expect(result.current.tasks.find((t) => t.id === 2).title).toBe("Leer sobre useReducer");
  expect((await getTasks()).find((t) => t.id === 2).title).toBe("Leer sobre useReducer");
});

test("removeTask quita la tarea del estado y del servidor", async () => {
  const result = await hookCargado();
  await act(() => result.current.removeTask(1));
  expect(result.current.tasks.map((t) => t.id)).toEqual([2]);
  expect((await getTasks()).map((t) => t.id)).toEqual([2]);
});

test("si una acción falla, la promesa se rechaza y las tareas no cambian", async () => {
  const result = await hookCargado();
  failNextRequest();
  await act(async () => {
    await expect(result.current.removeTask(1)).rejects.toThrow();
  });
  expect(result.current.tasks).toEqual(TAREAS);
});

test("App.jsx ya no importa la API: usa el hook", () => {
  expect(codigoApp).not.toMatch(/from\s+["']\.\/api(\.js)?["']/);
  expect(codigoApp).toMatch(/useTasks\s*\(/);
});
