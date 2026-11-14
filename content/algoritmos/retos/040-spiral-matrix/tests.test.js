import { test, expect } from "vitest";
import { espiral } from "./solucion.js";

test("ejemplo clásico: matriz de 3 x 3", () => {
  const matriz = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  expect(espiral(matriz)).toEqual([1, 2, 3, 6, 9, 8, 7, 4, 5]);
});

test("más columnas que filas: matriz de 3 x 4", () => {
  const matriz = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];
  expect(espiral(matriz)).toEqual([1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]);
});

test("más filas que columnas: matriz de 4 x 2", () => {
  const matriz = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ];
  expect(espiral(matriz)).toEqual([1, 2, 4, 6, 8, 7, 5, 3]);
});

test("una sola fila no repite elementos: [[1, 2, 3]]", () => {
  expect(espiral([[1, 2, 3]])).toEqual([1, 2, 3]);
});

test("una sola columna no repite elementos: [[1], [2], [3]]", () => {
  expect(espiral([[1], [2], [3]])).toEqual([1, 2, 3]);
});

test("matriz vacía da [] y un solo elemento da [5]", () => {
  expect(espiral([])).toEqual([]);
  expect(espiral([[5]])).toEqual([5]);
});

test("cuatro vueltas hacia adentro: matriz de 4 x 4", () => {
  const matriz = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ];
  expect(espiral(matriz)).toEqual([1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5, 6, 7, 11, 10]);
});
