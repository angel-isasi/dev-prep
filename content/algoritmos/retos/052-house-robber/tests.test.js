import { test, expect } from "vitest";
import { robarCasas } from "./solucion.js";

test("ejemplo clásico: [1, 2, 3, 1] da 4", () => {
  expect(robarCasas([1, 2, 3, 1])).toBe(4);
});

test("tres casas no vecinas: [2, 7, 9, 3, 1] da 12", () => {
  expect(robarCasas([2, 7, 9, 3, 1])).toBe(12);
});

test("alternar pares o impares no basta: [2, 1, 1, 2] da 4", () => {
  expect(robarCasas([2, 1, 1, 2])).toBe(4);
});

test("sin casas da 0 y una sola casa da su dinero", () => {
  expect(robarCasas([])).toBe(0);
  expect(robarCasas([5])).toBe(5);
});

test("dos casas: te quedas con la mayor", () => {
  expect(robarCasas([1, 2])).toBe(2);
  expect(robarCasas([8, 3])).toBe(8);
});

test("conviene saltarse una casa grande: [5, 10, 6] da 11", () => {
  expect(robarCasas([5, 10, 6])).toBe(11);
});

test("casas con 0 no estorban: [0, 0, 7, 0] da 7", () => {
  expect(robarCasas([0, 0, 7, 0])).toBe(7);
});
