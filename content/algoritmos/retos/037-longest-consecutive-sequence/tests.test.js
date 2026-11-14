import { test, expect } from "vitest";
import { secuenciaMasLarga } from "./solucion.js";

test("ejemplo clásico: [100, 4, 200, 1, 3, 2] da 4", () => {
  expect(secuenciaMasLarga([100, 4, 200, 1, 3, 2])).toBe(4);
});

test("secuencia larga con un repetido: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] da 9", () => {
  expect(secuenciaMasLarga([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])).toBe(9);
});

test("los repetidos cuentan una vez: [1, 2, 0, 1] da 3", () => {
  expect(secuenciaMasLarga([1, 2, 0, 1])).toBe(3);
});

test("arreglo vacío da 0 y un solo número da 1", () => {
  expect(secuenciaMasLarga([])).toBe(0);
  expect(secuenciaMasLarga([7])).toBe(1);
});

test("con negativos: [-3, -1, -2, 5, 0] da 4 (-3 al 0)", () => {
  expect(secuenciaMasLarga([-3, -1, -2, 5, 0])).toBe(4);
});

test("elige la más larga entre varias: [10, 5, 12, 3, 55, 30, 4, 11, 2] da 4", () => {
  expect(secuenciaMasLarga([10, 5, 12, 3, 55, 30, 4, 11, 2])).toBe(4);
});

test("ningún número es vecino de otro: [10, 20, 30] da 1", () => {
  expect(secuenciaMasLarga([10, 20, 30])).toBe(1);
});
