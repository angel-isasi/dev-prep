// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { reducer, Contador } from "./solucion.jsx";

test('el contador empieza en "Cuenta: 0"', () => {
  render(<Contador />);
  expect(screen.getByText("Cuenta: 0")).toBeTruthy();
});

test('dos clics en "+5" llegan a 10', () => {
  render(<Contador />);
  fireEvent.click(screen.getByText("+5"));
  fireEvent.click(screen.getByText("+5"));
  expect(screen.getByText("Cuenta: 10")).toBeTruthy();
});

test('"Reiniciar" vuelve a 0', () => {
  render(<Contador />);
  fireEvent.click(screen.getByText("+5"));
  fireEvent.click(screen.getByText("Reiniciar"));
  expect(screen.getByText("Cuenta: 0")).toBeTruthy();
});

test("el reducer suma el paso, o 1 si no hay paso, sin modificar el estado", () => {
  const estado = Object.freeze({ cuenta: 2 });
  expect(reducer(estado, { tipo: "sumar", paso: 5 })).toEqual({ cuenta: 7 });
  expect(reducer(estado, { tipo: "sumar" })).toEqual({ cuenta: 3 });
  expect(reducer(estado, { tipo: "reiniciar" })).toEqual({ cuenta: 0 });
  expect(estado).toEqual({ cuenta: 2 });
});

test("el reducer lanza un error con una acción desconocida", () => {
  expect(() => reducer({ cuenta: 0 }, { tipo: "volar" })).toThrow(/volar/);
});
