// @vitest-environment jsdom
import { beforeEach, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { resetDatabase } from "../src/api.js";
import { filterTasks } from "../src/filters.js";

const TAREAS = [
  { id: 1, title: "Leer la guía de useEffect", topic: "React", done: false },
  { id: 2, title: "Maquetar una tarjeta con Flexbox", topic: "CSS", done: true },
  { id: 3, title: "Practicar Grid", topic: "CSS", done: false },
  { id: 4, title: "Repasar closures", topic: "JavaScript", done: true },
];

beforeEach(() => {
  resetDatabase(TAREAS);
  localStorage.clear();
});

// Qué tareas se ven, en orden: busca el título conocido dentro de cada elemento de la lista
const titulosVisibles = () =>
  screen.queryAllByRole("listitem").map((li) => TAREAS.find((t) => within(li).queryByText(t.title))?.title);

async function abrirApp() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Practicar Grid");
  return user;
}

test("filterTasks filtra por estado sin cambiar el arreglo original", () => {
  const copia = structuredClone(TAREAS);
  expect(filterTasks(TAREAS, "pending", "").map((t) => t.id)).toEqual([1, 3]);
  expect(filterTasks(TAREAS, "done", "").map((t) => t.id)).toEqual([2, 4]);
  expect(filterTasks(TAREAS, "all", "").map((t) => t.id)).toEqual([1, 2, 3, 4]);
  expect(TAREAS).toEqual(copia);
});

test("filterTasks busca sin importar mayúsculas, tildes ni espacios, en el título y en el tema", () => {
  expect(filterTasks(TAREAS, "all", "  GUIA ").map((t) => t.id)).toEqual([1]);
  expect(filterTasks(TAREAS, "all", "css").map((t) => t.id)).toEqual([2, 3]);
  expect(filterTasks(TAREAS, "pending", "css").map((t) => t.id)).toEqual([3]);
});

test('el filtro "Pendientes" muestra solo las tareas sin hacer y queda presionado', async () => {
  const user = await abrirApp();
  const boton = screen.getByRole("button", { name: "Pendientes" });
  await user.click(boton);

  expect(titulosVisibles()).toEqual(["Leer la guía de useEffect", "Practicar Grid"]);
  expect(boton.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "Todas" }).getAttribute("aria-pressed")).toBe("false");
});

test('el filtro "Hechas" muestra solo las hechas y "Todas" vuelve a mostrar todo', async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Hechas" }));
  expect(titulosVisibles()).toEqual(["Maquetar una tarjeta con Flexbox", "Repasar closures"]);

  await user.click(screen.getByRole("button", { name: "Todas" }));
  expect(titulosVisibles()).toHaveLength(4);
});

test("la búsqueda filtra mientras escribes, sin importar tildes ni mayúsculas", async () => {
  const user = await abrirApp();
  await user.type(screen.getByLabelText("Buscar tareas"), "GUIA");
  expect(titulosVisibles()).toEqual(["Leer la guía de useEffect"]);
});

test("filtro y búsqueda se combinan, y el resumen sigue contando todas las tareas", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Hechas" }));
  await user.type(screen.getByLabelText("Buscar tareas"), "css");
  expect(titulosVisibles()).toEqual(["Maquetar una tarjeta con Flexbox"]);
  expect(screen.getByText("2 de 4 hechas")).toBeTruthy();
});

test('si nada coincide muestra "No hay tareas que coincidan"', async () => {
  const user = await abrirApp();
  await user.type(screen.getByLabelText("Buscar tareas"), "typescript");
  expect(titulosVisibles()).toEqual([]);
  expect(screen.getByText("No hay tareas que coincidan")).toBeTruthy();
});
