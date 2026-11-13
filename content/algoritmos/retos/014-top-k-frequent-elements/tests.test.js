import { test, expect } from "vitest";
import { topK } from "./solucion.js";

// El orden de la respuesta no importa: la ordenamos antes de comparar.
const ordenar = (arr) => [...arr].sort((a, b) => a - b);

test("ejemplo clásico: [1, 1, 1, 2, 2, 3] con k = 2", () => {
  expect(ordenar(topK([1, 1, 1, 2, 2, 3], 2))).toEqual([1, 2]);
});

test("un solo elemento: [1] con k = 1", () => {
  expect(topK([1], 1)).toEqual([1]);
});

test("k igual a la cantidad de números distintos: [4, 4, 5] con k = 2", () => {
  expect(ordenar(topK([4, 4, 5], 2))).toEqual([4, 5]);
});

test("el más frecuente no está al inicio: [1, 2, 3, 3, 3, 2] con k = 1", () => {
  expect(topK([1, 2, 3, 3, 3, 2], 1)).toEqual([3]);
});

test("con negativos devuelve números, no textos: [-1, -1, 2, -1, 3, 3] con k = 2", () => {
  expect(ordenar(topK([-1, -1, 2, -1, 3, 3], 2))).toEqual([-1, 3]);
});

test("todos aparecen una vez salvo uno: [5, 6, 7, 7] con k = 1", () => {
  expect(topK([5, 6, 7, 7], 1)).toEqual([7]);
});
