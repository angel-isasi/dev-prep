import { test, expect } from "vitest";
import { sumaOrdenada } from "./solucion.js";

test("ejemplo clásico: [2, 7, 11, 15] y 9 da [0, 1]", () => {
  expect(sumaOrdenada([2, 7, 11, 15], 9)).toEqual([0, 1]);
});

test("la pareja está en los extremos: [2, 3, 4] y 6 da [0, 2]", () => {
  expect(sumaOrdenada([2, 3, 4], 6)).toEqual([0, 2]);
});

test("solo dos elementos y uno negativo: [-1, 0] y -1 da [0, 1]", () => {
  expect(sumaOrdenada([-1, 0], -1)).toEqual([0, 1]);
});

test("dos valores iguales en posiciones distintas: [1, 2, 3, 4, 4, 9] y 8 da [3, 4]", () => {
  expect(sumaOrdenada([1, 2, 3, 4, 4, 9], 8)).toEqual([3, 4]);
});

test("la pareja está al final: [1, 2, 3, 4, 5, 6] y 11 da [4, 5]", () => {
  expect(sumaOrdenada([1, 2, 3, 4, 5, 6], 11)).toEqual([4, 5]);
});

test("negativos y positivos mezclados: [-5, -3, 0, 2, 4, 8] y 1 da [1, 4]", () => {
  expect(sumaOrdenada([-5, -3, 0, 2, 4, 8], 1)).toEqual([1, 4]);
});

test("con ceros: [-3, 0, 0, 5] y 0 da [1, 2]", () => {
  expect(sumaOrdenada([-3, 0, 0, 5], 0)).toEqual([1, 2]);
});
