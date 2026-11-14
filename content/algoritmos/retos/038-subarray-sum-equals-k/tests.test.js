import { test, expect } from "vitest";
import { contarSubarreglos } from "./solucion.js";

test("ejemplo clásico: [1, 1, 1] y k = 2 da 2", () => {
  expect(contarSubarreglos([1, 1, 1], 2)).toBe(2);
});

test("un subarreglo de un solo elemento también cuenta: [1, 2, 3] y k = 3 da 2", () => {
  expect(contarSubarreglos([1, 2, 3], 3)).toBe(2);
});

test("con negativos: [1, -1, 0] y k = 0 da 3", () => {
  expect(contarSubarreglos([1, -1, 0], 0)).toBe(3);
});

test("arreglo vacío da 0 y un elemento igual a k da 1", () => {
  expect(contarSubarreglos([], 0)).toBe(0);
  expect(contarSubarreglos([3], 3)).toBe(1);
});

test("solo ceros: [0, 0, 0] y k = 0 da 6 (todos los subarreglos)", () => {
  expect(contarSubarreglos([0, 0, 0], 0)).toBe(6);
});

test("varios que se solapan: [1, 2, 1, 2, 1] y k = 3 da 4", () => {
  expect(contarSubarreglos([1, 2, 1, 2, 1], 3)).toBe(4);
});

test("mezcla de positivos y negativos: [3, 4, 7, 2, -3, 1, 4, 2] y k = 7 da 4", () => {
  expect(contarSubarreglos([3, 4, 7, 2, -3, 1, 4, 2], 7)).toBe(4);
});

test("ninguno suma k: [1, 2, 3] y k = 7 da 0", () => {
  expect(contarSubarreglos([1, 2, 3], 7)).toBe(0);
});
