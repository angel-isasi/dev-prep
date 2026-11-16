// @vitest-environment jsdom
import { beforeEach, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { failNextRequest, resetDatabase } from "../src/api.js";
import { initialTasks } from "../src/data.js";

const DEL_SERVIDOR = [
  { id: 10, title: "Resolver un ejercicio de reduce", topic: "JavaScript", done: true },
  { id: 11, title: "Ver cómo funciona fetch", topic: "JavaScript", done: false },
];

beforeEach(() => {
  resetDatabase();
  localStorage.clear();
});

test('mientras espera a la API muestra "Cargando tareas..." y luego lo quita', async () => {
  render(<App />);
  expect(screen.getByText("Cargando tareas...")).toBeTruthy();
  expect(await screen.findByText(initialTasks[0].title)).toBeTruthy();
  expect(screen.queryByText("Cargando tareas...")).toBeNull();
});

test("muestra las tareas que devuelve la API (no las de data.js)", async () => {
  resetDatabase(DEL_SERVIDOR);
  render(<App />);
  expect(await screen.findByText("Resolver un ejercicio de reduce")).toBeTruthy();
  expect(screen.getByText("Ver cómo funciona fetch")).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("el resumen cuenta las tareas que llegaron de la API", async () => {
  resetDatabase(DEL_SERVIDOR);
  render(<App />);
  expect(await screen.findByText("1 de 2 hechas")).toBeTruthy();
});

test('si el servidor no tiene tareas muestra "No hay tareas"', async () => {
  resetDatabase([]);
  render(<App />);
  expect(await screen.findByText("No hay tareas")).toBeTruthy();
  expect(screen.queryByText("Cargando tareas...")).toBeNull();
});

test("si la API falla muestra una alerta y no muestra la lista", async () => {
  failNextRequest();
  render(<App />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("No se pudieron cargar las tareas.");
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  expect(screen.queryByText("Cargando tareas...")).toBeNull();
});

test('el botón "Reintentar" vuelve a pedir las tareas y las muestra', async () => {
  const user = userEvent.setup();
  failNextRequest();
  render(<App />);
  await screen.findByRole("alert");

  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText(initialTasks[0].title)).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getAllByRole("listitem")).toHaveLength(initialTasks.length);
});
