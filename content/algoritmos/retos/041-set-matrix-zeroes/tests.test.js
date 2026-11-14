import { test, expect } from "vitest";
import { ponerCeros } from "./solucion.js";

test("ejemplo clásico: un cero en el centro", () => {
  expect(ponerCeros([[1, 1, 1], [1, 0, 1], [1, 1, 1]])).toEqual([[1, 0, 1], [0, 0, 0], [1, 0, 1]]);
});

test("dos ceros en la primera fila", () => {
  expect(ponerCeros([[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]])).toEqual([
    [0, 0, 0, 0],
    [0, 4, 5, 0],
    [0, 3, 1, 0],
  ]);
});

test("modifica la misma matriz y la devuelve", () => {
  const matriz = [[1, 0], [1, 1]];
  const resultado = ponerCeros(matriz);
  expect(resultado).toBe(matriz);
  expect(matriz).toEqual([[0, 0], [1, 0]]);
});

test("los ceros que pones no contagian: [[0, 1], [1, 1]]", () => {
  expect(ponerCeros([[0, 1], [1, 1]])).toEqual([[0, 0], [0, 1]]);
});

test("sin ceros no cambia nada", () => {
  expect(ponerCeros([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
});

test("una sola fila y una sola columna", () => {
  expect(ponerCeros([[1, 0, 3]])).toEqual([[0, 0, 0]]);
  expect(ponerCeros([[1], [0], [2]])).toEqual([[0], [0], [0]]);
});

test("matriz que no es cuadrada (3 x 4)", () => {
  expect(ponerCeros([[1, 2, 3, 4], [5, 0, 7, 8], [9, 10, 11, 12]])).toEqual([
    [1, 0, 3, 4],
    [0, 0, 0, 0],
    [9, 0, 11, 12],
  ]);
});
