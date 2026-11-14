import { test, expect } from "vitest";
import { subsecuenciaCreciente } from "./solucion.js";

test("ejemplo clásico: [10, 9, 2, 5, 3, 7, 101, 18] da 4", () => {
  expect(subsecuenciaCreciente([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4);
});

test("saltando elementos: [0, 1, 0, 3, 2, 3] da 4 ([0, 1, 2, 3])", () => {
  expect(subsecuenciaCreciente([0, 1, 0, 3, 2, 3])).toBe(4);
});

test("estrictamente creciente: [7, 7, 7, 7] da 1", () => {
  expect(subsecuenciaCreciente([7, 7, 7, 7])).toBe(1);
});

test("vacío da 0 y un solo número da 1", () => {
  expect(subsecuenciaCreciente([])).toBe(0);
  expect(subsecuenciaCreciente([42])).toBe(1);
});

test("ya ordenado da el largo total y al revés da 1", () => {
  expect(subsecuenciaCreciente([1, 2, 3, 4, 5])).toBe(5);
  expect(subsecuenciaCreciente([5, 4, 3, 2, 1])).toBe(1);
});

test("la mejor no termina en el último elemento: [1, 2, 3, 0] da 3", () => {
  expect(subsecuenciaCreciente([1, 2, 3, 0])).toBe(3);
});

test("no basta con contar subidas seguidas: [1, 5, 2, 3, 4] da 4", () => {
  expect(subsecuenciaCreciente([1, 5, 2, 3, 4])).toBe(4);
});
