import { test, expect } from "vitest";
import { fusionar } from "./solucion.js";

test("ejemplo clásico: [[1, 3], [2, 6], [8, 10], [15, 18]]", () => {
  expect(fusionar([[1, 3], [2, 6], [8, 10], [15, 18]])).toEqual([[1, 6], [8, 10], [15, 18]]);
});

test("se tocan en un punto: [[1, 4], [4, 5]] da [[1, 5]]", () => {
  expect(fusionar([[1, 4], [4, 5]])).toEqual([[1, 5]]);
});

test("uno contenido en otro: [[1, 4], [2, 3]] da [[1, 4]]", () => {
  expect(fusionar([[1, 4], [2, 3]])).toEqual([[1, 4]]);
});

test("vienen desordenados: [[8, 10], [1, 3], [2, 6]]", () => {
  expect(fusionar([[8, 10], [1, 3], [2, 6]])).toEqual([[1, 6], [8, 10]]);
});

test("vacío y un solo intervalo", () => {
  expect(fusionar([])).toEqual([]);
  expect(fusionar([[5, 7]])).toEqual([[5, 7]]);
});

test("no modifica el arreglo original ni sus intervalos", () => {
  const intervalos = [[2, 6], [1, 3]];
  fusionar(intervalos);
  expect(intervalos).toEqual([[2, 6], [1, 3]]);
});
