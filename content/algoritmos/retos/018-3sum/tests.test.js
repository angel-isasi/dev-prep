import { test, expect } from "vitest";
import { tresSuma } from "./solucion.js";

// El orden no importa: ordeno cada trío y luego la lista de tríos.
const normalizar = (trios) =>
  trios
    .map((t) => [...t].sort((x, y) => x - y))
    .sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]);

test("ejemplo clásico: [-1, 0, 1, 2, -1, -4]", () => {
  expect(normalizar(tresSuma([-1, 0, 1, 2, -1, -4]))).toEqual([
    [-1, -1, 2],
    [-1, 0, 1],
  ]);
});

test("muchos ceros: [0, 0, 0, 0] da un solo trío", () => {
  expect(normalizar(tresSuma([0, 0, 0, 0]))).toEqual([[0, 0, 0]]);
});

test("menos de tres números: [] y [1, 2] dan []", () => {
  expect(tresSuma([])).toEqual([]);
  expect(tresSuma([1, 2])).toEqual([]);
});

test("sin solución: [1, 2, -2, -1] da []", () => {
  expect(tresSuma([1, 2, -2, -1])).toEqual([]);
});

test("valores repetidos no repiten tríos: [-2, 0, 0, 2, 2]", () => {
  expect(normalizar(tresSuma([-2, 0, 0, 2, 2]))).toEqual([[-2, 0, 2]]);
});

test("varios tríos con el mismo número fijo y no modifica la entrada", () => {
  const nums = [2, 1, -2, 1, 0];
  expect(normalizar(tresSuma(nums))).toEqual([
    [-2, 0, 2],
    [-2, 1, 1],
  ]);
  expect(nums).toEqual([2, 1, -2, 1, 0]);
});
