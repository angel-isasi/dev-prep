// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { contarPorEstado, ResumenEstados } from "./solucion.jsx";

const PEDIDOS = [{ estado: "en horno" }, { estado: "listo" }, { estado: "en horno" }];

test("contarPorEstado cuenta cuántos hay de cada estado", () => {
  expect(contarPorEstado(PEDIDOS)).toEqual({ "en horno": 2, listo: 1 });
});

test("contarPorEstado respeta el orden de aparición", () => {
  const conteo = contarPorEstado([{ estado: "listo" }, { estado: "en camino" }, { estado: "listo" }]);
  expect(Object.keys(conteo)).toEqual(["listo", "en camino"]);
});

test("ResumenEstados muestra el conteo separado por comas", () => {
  render(<ResumenEstados pedidos={PEDIDOS} />);
  expect(screen.getByText("2 en horno, 1 listo")).toBeTruthy();
});

test('sin pedidos muestra "Sin pedidos"', () => {
  render(<ResumenEstados pedidos={[]} />);
  expect(screen.getByText("Sin pedidos")).toBeTruthy();
});
