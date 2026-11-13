import { test, expect } from "vitest";
import { faltante } from "./solucion.js";

test("falta uno del medio: [3, 0, 1] da 2", () => {
  expect(faltante([3, 0, 1])).toBe(2);
});

test("falta el último del rango: [0, 1] da 2", () => {
  expect(faltante([0, 1])).toBe(2);
});

test("falta el cero: [1, 2, 3] da 0", () => {
  expect(faltante([1, 2, 3])).toBe(0);
});

test("un solo elemento: [0] da 1 y [1] da 0", () => {
  expect(faltante([0])).toBe(1);
  expect(faltante([1])).toBe(0);
});

test("desordenado y más largo: [9, 6, 4, 2, 3, 5, 7, 0, 1] da 8", () => {
  expect(faltante([9, 6, 4, 2, 3, 5, 7, 0, 1])).toBe(8);
});
