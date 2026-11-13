import { test, expect } from "vitest";
import { maxSubarreglo } from "./solucion.js";

test("ejemplo clásico: [-2, 1, -3, 4, -1, 2, 1, -5, 4] da 6", () => {
  expect(maxSubarreglo([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toBe(6);
});

test("un solo elemento: [1] da 1", () => {
  expect(maxSubarreglo([1])).toBe(1);
});

test("todos negativos: [-3, -1, -2] da -1, no 0", () => {
  expect(maxSubarreglo([-3, -1, -2])).toBe(-1);
});

test("todos positivos: conviene tomar todo el arreglo", () => {
  expect(maxSubarreglo([1, 2, 3])).toBe(6);
});

test("conviene cruzar un negativo: [5, 4, -1, 7, 8] da 23", () => {
  expect(maxSubarreglo([5, 4, -1, 7, 8])).toBe(23);
});

test("conviene empezar de nuevo: [2, -5, 3] da 3", () => {
  expect(maxSubarreglo([2, -5, 3])).toBe(3);
});
