import { test, expect } from "vitest";
import { mayoritario } from "./solucion.js";

test("arreglo corto: [3, 2, 3] da 3", () => {
  expect(mayoritario([3, 2, 3])).toBe(3);
});

test("mezclado: [2, 2, 1, 1, 1, 2, 2] da 2", () => {
  expect(mayoritario([2, 2, 1, 1, 1, 2, 2])).toBe(2);
});

test("un solo elemento: [7] da 7", () => {
  expect(mayoritario([7])).toBe(7);
});

test("el mayoritario se concentra al final: [1, 2, 3, 3, 3] da 3", () => {
  expect(mayoritario([1, 2, 3, 3, 3])).toBe(3);
});

test("con negativos: [-1, 4, -1] da -1 (un número, no el texto \"-1\")", () => {
  expect(mayoritario([-1, 4, -1])).toBe(-1);
});

test("todos iguales: [4, 4, 4, 4] da 4", () => {
  expect(mayoritario([4, 4, 4, 4])).toBe(4);
});
