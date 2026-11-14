import { test, expect } from "vitest";
import { intervalosAQuitar } from "./solucion.js";

test("ejemplo clásico: [[1, 2], [2, 3], [3, 4], [1, 3]] da 1", () => {
  expect(intervalosAQuitar([[1, 2], [2, 3], [3, 4], [1, 3]])).toBe(1);
});

test("todos iguales: [[1, 2], [1, 2], [1, 2]] da 2", () => {
  expect(intervalosAQuitar([[1, 2], [1, 2], [1, 2]])).toBe(2);
});

test("tocarse no es superponerse: [[1, 2], [2, 3]] da 0", () => {
  expect(intervalosAQuitar([[1, 2], [2, 3]])).toBe(0);
});

test("vacío y un solo intervalo dan 0", () => {
  expect(intervalosAQuitar([])).toBe(0);
  expect(intervalosAQuitar([[5, 8]])).toBe(0);
});

test("uno largo que tapa a varios: conviene quitar solo ese", () => {
  expect(intervalosAQuitar([[1, 100], [2, 3], [4, 5], [6, 7]])).toBe(1);
});

test("desordenados y con negativos", () => {
  expect(intervalosAQuitar([[7, 9], [1, 4], [3, 6], [5, 8]])).toBe(2);
  expect(intervalosAQuitar([[-3, -1], [-2, 0], [0, 2]])).toBe(1);
});

test("no modifica el arreglo original", () => {
  const intervalos = [[3, 6], [1, 4]];
  intervalosAQuitar(intervalos);
  expect(intervalos).toEqual([[3, 6], [1, 4]]);
});
