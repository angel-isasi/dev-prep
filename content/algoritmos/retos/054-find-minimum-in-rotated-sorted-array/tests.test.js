import { test, expect } from "vitest";
import { minimoRotado } from "./solucion.js";

test("ejemplo clásico: [3, 4, 5, 1, 2] da 1", () => {
  expect(minimoRotado([3, 4, 5, 1, 2])).toBe(1);
});

test("el mínimo está a la derecha del medio: [4, 5, 6, 7, 0, 1, 2] da 0", () => {
  expect(minimoRotado([4, 5, 6, 7, 0, 1, 2])).toBe(0);
});

test("sin rotar: [11, 13, 15, 17] da 11", () => {
  expect(minimoRotado([11, 13, 15, 17])).toBe(11);
});

test("un solo elemento y dos elementos", () => {
  expect(minimoRotado([1])).toBe(1);
  expect(minimoRotado([2, 1])).toBe(1);
  expect(minimoRotado([1, 2])).toBe(1);
});

test("el mínimo está al final: [2, 3, 4, 5, 1] da 1", () => {
  expect(minimoRotado([2, 3, 4, 5, 1])).toBe(1);
});

test("el mínimo está justo después del inicio: [5, 1, 2, 3, 4] da 1", () => {
  expect(minimoRotado([5, 1, 2, 3, 4])).toBe(1);
});

test("el mínimo cae justo en el medio: [4, 5, 1, 2, 3] da 1", () => {
  expect(minimoRotado([4, 5, 1, 2, 3])).toBe(1);
});

test("con negativos: [-1, 0, -5, -3, -2] da -5", () => {
  expect(minimoRotado([-1, 0, -5, -3, -2])).toBe(-5);
});
