import { test, expect } from "vitest";
import { rotar } from "./solucion.js";

test("ejemplo clásico: [1, 2, 3, 4, 5, 6, 7] rotado 3 queda [5, 6, 7, 1, 2, 3, 4]", () => {
  const nums = [1, 2, 3, 4, 5, 6, 7];
  rotar(nums, 3);
  expect(nums).toEqual([5, 6, 7, 1, 2, 3, 4]);
});

test("con negativos: [-1, -100, 3, 99] rotado 2 queda [3, 99, -1, -100]", () => {
  const nums = [-1, -100, 3, 99];
  rotar(nums, 2);
  expect(nums).toEqual([3, 99, -1, -100]);
});

test("una sola posición: el último pasa al inicio", () => {
  const nums = [1, 2, 3, 4];
  rotar(nums, 1);
  expect(nums).toEqual([4, 1, 2, 3]);
});

test("k mayor que el largo: [1, 2, 3] rotado 4 queda [3, 1, 2]", () => {
  const nums = [1, 2, 3];
  rotar(nums, 4);
  expect(nums).toEqual([3, 1, 2]);
});

test("k = 0 y k igual al largo dejan el arreglo igual", () => {
  const a = [1, 2, 3];
  rotar(a, 0);
  expect(a).toEqual([1, 2, 3]);
  const b = [1, 2, 3];
  rotar(b, 3);
  expect(b).toEqual([1, 2, 3]);
});

test("un solo elemento queda igual con cualquier k", () => {
  const nums = [9];
  rotar(nums, 5);
  expect(nums).toEqual([9]);
});

test("modifica el mismo arreglo: [1, 2, 3, 4, 5, 6] rotado 4 queda [3, 4, 5, 6, 1, 2]", () => {
  const nums = [1, 2, 3, 4, 5, 6];
  const mismo = nums;
  rotar(nums, 4);
  expect(mismo).toEqual([3, 4, 5, 6, 1, 2]);
});
