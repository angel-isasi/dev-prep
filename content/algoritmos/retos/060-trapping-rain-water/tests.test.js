import { test, expect } from "vitest";
import { aguaAtrapada } from "./solucion.js";

test("ejemplo clásico: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] da 6", () => {
  expect(aguaAtrapada([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])).toBe(6);
});

test("la pared alta está al final: [4, 2, 0, 3, 2, 5] da 9", () => {
  expect(aguaAtrapada([4, 2, 0, 3, 2, 5])).toBe(9);
});

test("un pozo simple: [3, 0, 3] da 3", () => {
  expect(aguaAtrapada([3, 0, 3])).toBe(3);
});

test("sin columnas o con menos de 3: 0", () => {
  expect(aguaAtrapada([])).toBe(0);
  expect(aguaAtrapada([5])).toBe(0);
  expect(aguaAtrapada([2, 7])).toBe(0);
});

test("escaleras no atrapan agua", () => {
  expect(aguaAtrapada([1, 2, 3, 4])).toBe(0);
  expect(aguaAtrapada([4, 3, 2, 1])).toBe(0);
});

test("manda la pared más baja de las dos: [3, 0, 0, 2, 0, 4] da 10", () => {
  expect(aguaAtrapada([3, 0, 0, 2, 0, 4])).toBe(10);
});

test("la pared más alta en el medio: [2, 0, 5, 0, 3] da 5", () => {
  expect(aguaAtrapada([2, 0, 5, 0, 3])).toBe(5);
});
