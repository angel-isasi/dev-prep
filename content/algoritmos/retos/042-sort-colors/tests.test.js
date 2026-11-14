import { test, expect } from "vitest";
import { ordenarColores } from "./solucion.js";

test("ejemplo clásico: [2, 0, 2, 1, 1, 0]", () => {
  expect(ordenarColores([2, 0, 2, 1, 1, 0])).toEqual([0, 0, 1, 1, 2, 2]);
});

test("un color de cada uno: [2, 0, 1]", () => {
  expect(ordenarColores([2, 0, 1])).toEqual([0, 1, 2]);
});

test("modifica el mismo arreglo y lo devuelve", () => {
  const nums = [1, 0];
  const resultado = ordenarColores(nums);
  expect(resultado).toBe(nums);
  expect(nums).toEqual([0, 1]);
});

test("después de traer algo desde el final hay que revisarlo: [1, 2, 0]", () => {
  expect(ordenarColores([1, 2, 0])).toEqual([0, 1, 2]);
});

test("vacío, un elemento y un solo color", () => {
  expect(ordenarColores([])).toEqual([]);
  expect(ordenarColores([2])).toEqual([2]);
  expect(ordenarColores([1, 1, 1])).toEqual([1, 1, 1]);
});

test("ya ordenado y al revés", () => {
  expect(ordenarColores([0, 1, 2])).toEqual([0, 1, 2]);
  expect(ordenarColores([2, 2, 1, 1, 0, 0])).toEqual([0, 0, 1, 1, 2, 2]);
});
