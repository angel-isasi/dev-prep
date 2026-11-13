import { test, expect } from "vitest";
import { maxAgua } from "./solucion.js";

test("ejemplo clásico: [1, 8, 6, 2, 5, 4, 8, 3, 7] da 49", () => {
  expect(maxAgua([1, 8, 6, 2, 5, 4, 8, 3, 7])).toBe(49);
});

test("solo dos líneas: [1, 1] da 1", () => {
  expect(maxAgua([1, 1])).toBe(1);
});

test("los extremos son la mejor opción: [4, 3, 2, 1, 4] da 16", () => {
  expect(maxAgua([4, 3, 2, 1, 4])).toBe(16);
});

test("escalera: [1, 2, 3, 4, 5, 6] da 9 (ni las más altas ni las más lejanas)", () => {
  expect(maxAgua([1, 2, 3, 4, 5, 6])).toBe(9);
});

test("la línea más alta no siempre sirve: [1, 2, 4, 3] da 4", () => {
  expect(maxAgua([1, 2, 4, 3])).toBe(4);
});

test("líneas de altura 0 no guardan agua: [0, 0] da 0 y [0, 5, 0] da 0", () => {
  expect(maxAgua([0, 0])).toBe(0);
  expect(maxAgua([0, 5, 0])).toBe(0);
});
