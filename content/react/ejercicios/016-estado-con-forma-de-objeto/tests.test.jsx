// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArmarPizza } from "./solucion.jsx";

function elegir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

test('al inicio muestra "margarita M"', () => {
  render(<ArmarPizza />);
  expect(screen.getByText("margarita M")).toBeTruthy();
  expect(screen.getByLabelText("Tipo").value).toBe("margarita");
  expect(screen.getByLabelText("Tamaño").value).toBe("M");
});

test("cambiar el tipo actualiza solo el tipo", () => {
  render(<ArmarPizza />);
  elegir("Tipo", "pepperoni");
  expect(screen.getByText("pepperoni M")).toBeTruthy();
});

test("cambiar el tamaño actualiza solo el tamaño", () => {
  render(<ArmarPizza />);
  elegir("Tamaño", "L");
  expect(screen.getByText("margarita L")).toBeTruthy();
});

test("cambiar los dos no pierde ninguno de los campos", () => {
  render(<ArmarPizza />);
  elegir("Tipo", "pepperoni");
  elegir("Tamaño", "L");
  expect(screen.getByText("pepperoni L")).toBeTruthy();
  expect(screen.getByLabelText("Tipo").value).toBe("pepperoni");
  expect(screen.getByLabelText("Tamaño").value).toBe("L");
});

test("los selects tienen el name del campo que controlan", () => {
  render(<ArmarPizza />);
  expect(screen.getByLabelText("Tipo").name).toBe("tipo");
  expect(screen.getByLabelText("Tamaño").name).toBe("tamano");
});
