// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tareas } from "./solucion.jsx";

function agregar(texto) {
  fireEvent.change(screen.getByLabelText("Nueva tarea"), { target: { value: texto } });
  fireEvent.click(screen.getByText("Agregar"));
}

function textos() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent.replace("×", "").trim());
}

test("agrega tareas a la lista, sin espacios sobrantes", () => {
  render(<Tareas />);
  agregar("Estudiar React");
  agregar("  Practicar map  ");
  expect(textos()).toEqual(["Estudiar React", "Practicar map"]);
  expect(screen.getByText("2 pendientes")).toBeTruthy();
});

test("no agrega texto vacío ni solo espacios", () => {
  render(<Tareas />);
  agregar("");
  agregar("   ");
  expect(screen.queryAllByRole("listitem").length).toBe(0);
  expect(screen.getByText("0 pendientes")).toBeTruthy();
});

test("limpia el input después de agregar", () => {
  render(<Tareas />);
  agregar("Leer");
  expect(screen.getByLabelText("Nueva tarea").value).toBe("");
});

test("también agrega al enviar el formulario con Enter", () => {
  render(<Tareas />);
  const input = screen.getByLabelText("Nueva tarea");
  fireEvent.change(input, { target: { value: "Con Enter" } });
  fireEvent.submit(input.closest("form"));
  expect(textos()).toEqual(["Con Enter"]);
});

test("marcar el checkbox actualiza las pendientes", () => {
  render(<Tareas />);
  agregar("Estudiar React");
  agregar("Hacer ejercicio");
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  expect(screen.getByText("1 pendientes")).toBeTruthy();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  expect(screen.getByText("2 pendientes")).toBeTruthy();
});

test("elimina solo la tarea indicada", () => {
  render(<Tareas />);
  agregar("Estudiar React");
  agregar("Hacer ejercicio");
  fireEvent.click(screen.getByLabelText("Eliminar Estudiar React"));
  expect(textos()).toEqual(["Hacer ejercicio"]);
});
