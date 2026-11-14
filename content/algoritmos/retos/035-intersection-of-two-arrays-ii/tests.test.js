import { test, expect } from "vitest";
import { interseccion } from "./solucion.js";

// El orden del resultado no importa: ordenamos antes de comparar.
const ordenar = (arr) => [...arr].sort((a, b) => a - b);

test("ejemplo clásico: [1, 2, 2, 1] y [2, 2] da [2, 2]", () => {
  expect(ordenar(interseccion([1, 2, 2, 1], [2, 2]))).toEqual([2, 2]);
});

test("varios en común: [4, 9, 5] y [9, 4, 9, 8, 4] da [4, 9]", () => {
  expect(ordenar(interseccion([4, 9, 5], [9, 4, 9, 8, 4]))).toEqual([4, 9]);
});

test("no repite más de lo que hay en el primero: [2] y [2, 2] da [2]", () => {
  expect(ordenar(interseccion([2], [2, 2]))).toEqual([2]);
});

test("se queda con el mínimo de repeticiones: [1, 1, 1, 2] y [1, 1] da [1, 1]", () => {
  expect(ordenar(interseccion([1, 1, 1, 2], [1, 1]))).toEqual([1, 1]);
});

test("sin elementos en común da []", () => {
  expect(interseccion([1, 2], [3, 4])).toEqual([]);
});

test("con un arreglo vacío da []", () => {
  expect(interseccion([], [1, 2])).toEqual([]);
  expect(interseccion([1, 2], [])).toEqual([]);
});

test("con negativos y ceros: [-1, 0, 0, 3] y [0, -1, 0, 0] da [-1, 0, 0]", () => {
  expect(ordenar(interseccion([-1, 0, 0, 3], [0, -1, 0, 0]))).toEqual([-1, 0, 0]);
});
