import { test, expect } from "vitest";
import { twoSum } from "./solucion.js";

test("la pareja está al inicio: [2, 7, 11, 15] y 9", () => {
  expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
});

test("la pareja no está al inicio: [3, 2, 4] y 6", () => {
  expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
});

test("dos números iguales: [3, 3] y 6", () => {
  expect(twoSum([3, 3], 6)).toEqual([0, 1]);
});

test("no usa el mismo elemento dos veces: [3, 4, 2] y 6", () => {
  expect(twoSum([3, 4, 2], 6)).toEqual([1, 2]);
});

test("con números negativos: [-1, -2, -3, -4, -5] y -8", () => {
  expect(twoSum([-1, -2, -3, -4, -5], -8)).toEqual([2, 4]);
});

test("con ceros: [0, 4, 3, 0] y 0", () => {
  expect(twoSum([0, 4, 3, 0], 0)).toEqual([0, 3]);
});
