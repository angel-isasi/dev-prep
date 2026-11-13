import { test, expect } from "vitest";
import { partir } from "./solucion.js";

test("el último grupo se queda con lo que sobra", () => {
  expect(partir([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
});

test("si el largo es múltiplo del tamaño, todos los grupos quedan completos", () => {
  expect(partir([1, 2, 3, 4, 5, 6], 3)).toEqual([
    [1, 2, 3],
    [4, 5, 6],
  ]);
});

test("un arreglo vacío devuelve []", () => {
  expect(partir([], 3)).toEqual([]);
});

test("si el tamaño es mayor que el arreglo, devuelve un solo grupo", () => {
  expect(partir([1, 2], 5)).toEqual([[1, 2]]);
  expect(partir(["a", "b", "c"], 1)).toEqual([["a"], ["b"], ["c"]]);
});

test("no modifica el arreglo original", () => {
  const original = [1, 2, 3, 4];
  partir(original, 3);
  expect(original).toEqual([1, 2, 3, 4]);
});
