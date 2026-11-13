import { test, expect } from "vitest";
import { maxGanancia } from "./solucion.js";

test("ejemplo clásico: [7, 1, 5, 3, 6, 4] da 5", () => {
  expect(maxGanancia([7, 1, 5, 3, 6, 4])).toBe(5);
});

test("los precios solo bajan: [7, 6, 4, 3, 1] da 0", () => {
  expect(maxGanancia([7, 6, 4, 3, 1])).toBe(0);
});

test("el precio más bajo llega después del más alto: [3, 8, 1, 4] da 5, no 7", () => {
  expect(maxGanancia([3, 8, 1, 4])).toBe(5);
});

test("el mínimo tardío da la mejor ganancia: [2, 4, 1, 7] da 6", () => {
  expect(maxGanancia([2, 4, 1, 7])).toBe(6);
});

test("un solo día: [2] da 0", () => {
  expect(maxGanancia([2])).toBe(0);
});

test("sin días: [] da 0", () => {
  expect(maxGanancia([])).toBe(0);
});
