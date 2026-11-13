import { test, expect } from "vitest";
import { sumar } from "./solucion.js";

test("suma todos los números", () => {
  expect(sumar([5, 10, 15])).toBe(30);
});

test("un arreglo vacío suma 0", () => {
  expect(sumar([])).toBe(0);
});

test("un solo elemento devuelve ese elemento", () => {
  expect(sumar([7])).toBe(7);
});

test("funciona con negativos", () => {
  expect(sumar([-5, 10, -3])).toBe(2);
});
