// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as modulo from "./solucion.jsx";

const { Reporte } = modulo;
const PEDIDOS = [{ monto: 30 }, { monto: 55 }];

// Se lee del módulo cada vez para ver el valor actual del contador.
const calculosAhora = () => modulo.calculos;

test("muestra el total y el mayor", () => {
  render(<Reporte pedidos={PEDIDOS} />);
  expect(screen.getByText("Total 85, mayor 55")).toBeTruthy();
});

test("hacer clic no vuelve a ejecutar el cálculo", () => {
  const antes = calculosAhora();
  render(<Reporte pedidos={PEDIDOS} />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("Clics: 2");
  expect(screen.getByText("Total 85, mayor 55")).toBeTruthy();
  expect(calculosAhora() - antes).toBe(1);
});

test("si llega otro arreglo de pedidos, recalcula", () => {
  const antes = calculosAhora();
  const { rerender } = render(<Reporte pedidos={PEDIDOS} />);
  rerender(<Reporte pedidos={[{ monto: 10 }, { monto: 70 }]} />);
  expect(screen.getByText("Total 80, mayor 70")).toBeTruthy();
  expect(calculosAhora() - antes).toBe(2);
});

test("si el padre pasa el mismo arreglo, no recalcula", () => {
  const antes = calculosAhora();
  const { rerender } = render(<Reporte pedidos={PEDIDOS} />);
  rerender(<Reporte pedidos={PEDIDOS} />);
  rerender(<Reporte pedidos={PEDIDOS} />);
  expect(calculosAhora() - antes).toBe(1);
});
