// @vitest-environment jsdom
import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import App from "../src/App.jsx";
import { TaskList } from "../src/components/TaskList.jsx";
import { initialTasks } from "../src/data.js";

const TAREAS = [
  { id: 1, title: "Repasar closures", topic: "JavaScript", done: false },
  { id: 2, title: "Leer sobre useState", topic: "React", done: true },
  { id: 3, title: "Practicar Flexbox", topic: "CSS", done: false },
];

test("TaskList muestra un elemento de lista por cada tarea", () => {
  render(<TaskList tasks={TAREAS} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});

test("cada tarea muestra su título y su tema, en orden", () => {
  render(<TaskList tasks={TAREAS} />);
  const items = screen.getAllByRole("listitem");
  TAREAS.forEach((tarea, i) => {
    expect(within(items[i]).getByText(tarea.title)).toBeTruthy();
    expect(within(items[i]).getByText(tarea.topic)).toBeTruthy();
  });
});

test('las tareas hechas llevan la clase "task--done" y las pendientes no', () => {
  render(<TaskList tasks={TAREAS} />);
  const items = screen.getAllByRole("listitem");
  expect(items[1].classList.contains("task--done")).toBe(true);
  expect(items[0].classList.contains("task--done")).toBe(false);
});

test('con una lista vacía muestra "No hay tareas" y ningún elemento de lista', () => {
  render(<TaskList tasks={[]} />);
  expect(screen.getByText("No hay tareas")).toBeTruthy();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test('App muestra el título principal "Tablero de estudio"', () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Tablero de estudio" })).toBeTruthy();
});

test("App muestra todas las tareas de src/data.js", async () => {
  render(<App />);
  for (const tarea of initialTasks) {
    expect(await screen.findByText(tarea.title)).toBeTruthy();
  }
});
