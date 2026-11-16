import { test, expect } from "vitest";
import { promedio } from "./solucion.js";

test("el promedio de varias notas es un número, no NaN", () => {
  expect(promedio([20, 20])).not.toBeNaN();
});

test("calcula el promedio de tres notas", () => {
  expect(promedio([14, 16, 18])).toBe(16);
});

test("con una sola nota, el promedio es esa nota", () => {
  expect(promedio([11])).toBe(11);
});

test("el promedio puede tener decimales", () => {
  expect(promedio([10, 11])).toBe(10.5);
});

test("sin notas devuelve 0", () => {
  expect(promedio([])).toBe(0);
});
