import { test, expect } from "vitest";
import { soloPares } from "./solucion.js";

test("se queda solo con los pares, en orden", () => {
  expect(soloPares([1, 2, 3, 4, 10])).toEqual([2, 4, 10]);
});

test("el cero y los negativos pares también cuentan", () => {
  expect(soloPares([-4, -3, 0, 7])).toEqual([-4, 0]);
});

test("si no hay pares devuelve un arreglo vacío", () => {
  expect(soloPares([1, 3, 5])).toEqual([]);
});

test("un arreglo vacío devuelve un arreglo vacío", () => {
  expect(soloPares([])).toEqual([]);
});

test("no modifica el arreglo original", () => {
  const nums = [1, 2, 3, 4];
  soloPares(nums);
  expect(nums).toEqual([1, 2, 3, 4]);
});
