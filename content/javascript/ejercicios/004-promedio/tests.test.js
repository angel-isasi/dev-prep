import { test, expect } from "vitest";
import { promedio } from "./solucion.js";

test("calcula el promedio", () => {
  expect(promedio([12, 15, 18])).toBe(15);
});

test("un arreglo vacío devuelve 0 y no NaN", () => {
  expect(promedio([])).toBe(0);
});

test("el promedio puede tener decimales", () => {
  expect(promedio([1, 2])).toBe(1.5);
});

test("un solo elemento es su propio promedio", () => {
  expect(promedio([17])).toBe(17);
});

test("funciona con negativos", () => {
  expect(promedio([-4, 4, 6])).toBe(2);
});
