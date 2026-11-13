// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { mover, ListaPasos } from "./solucion.jsx";

const PASOS = Object.freeze(["masa", "salsa", "queso"]);

function ordenVisible() {
  return screen.getAllByRole("listitem").map((li) => li.querySelector("span").textContent);
}

test("sube y baja intercambiando con el vecino", () => {
  expect(mover(PASOS, 2, -1)).toEqual(["masa", "queso", "salsa"]);
  expect(mover(PASOS, 0, 1)).toEqual(["salsa", "masa", "queso"]);
});

test("no modifica la lista original y devuelve una nueva", () => {
  const resultado = mover(PASOS, 1, 1);
  expect(resultado).not.toBe(PASOS);
  expect(PASOS).toEqual(["masa", "salsa", "queso"]);
});

test("si se sale de la lista devuelve la misma referencia", () => {
  expect(mover(PASOS, 0, -1)).toBe(PASOS);
  expect(mover(PASOS, 2, 1)).toBe(PASOS);
});

test("el componente reordena con los botones", () => {
  render(<ListaPasos pasosIniciales={["masa", "salsa", "queso"]} />);
  fireEvent.click(screen.getByLabelText("Subir queso"));
  expect(ordenVisible()).toEqual(["masa", "queso", "salsa"]);
  fireEvent.click(screen.getByLabelText("Bajar masa"));
  expect(ordenVisible()).toEqual(["queso", "masa", "salsa"]);
});

test("subir el primero y bajar el último están deshabilitados", () => {
  render(<ListaPasos pasosIniciales={["masa", "salsa", "queso"]} />);
  expect(screen.getByLabelText("Subir masa").disabled).toBe(true);
  expect(screen.getByLabelText("Bajar queso").disabled).toBe(true);
  expect(screen.getByLabelText("Bajar masa").disabled).toBe(false);
});
