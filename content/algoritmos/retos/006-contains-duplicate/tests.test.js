import { test, expect } from "vitest";
import { tieneDuplicados } from "./solucion.js";

test("el primero se repite al final: [1, 2, 3, 1]", () => {
  expect(tieneDuplicados([1, 2, 3, 1])).toBe(true);
});

test("todos distintos: [1, 2, 3, 4]", () => {
  expect(tieneDuplicados([1, 2, 3, 4])).toBe(false);
});

test("arreglo vacío y de un elemento no tienen duplicados", () => {
  expect(tieneDuplicados([])).toBe(false);
  expect(tieneDuplicados([7])).toBe(false);
});

test("con negativos y ceros: [-1, 5, -1] y [0, 3, 0]", () => {
  expect(tieneDuplicados([-1, 5, -1])).toBe(true);
  expect(tieneDuplicados([0, 3, 0])).toBe(true);
});

test("muchos repetidos: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]", () => {
  expect(tieneDuplicados([1, 1, 1, 3, 3, 4, 3, 2, 4, 2])).toBe(true);
});

test("no modifica el arreglo original", () => {
  const nums = [3, 1, 2, 1];
  tieneDuplicados(nums);
  expect(nums).toEqual([3, 1, 2, 1]);
});
