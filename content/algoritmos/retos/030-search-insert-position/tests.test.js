import { test, expect } from "vitest";
import { posicionInsertar } from "./solucion.js";

const nums = [1, 3, 5, 6];

test("el objetivo está: 5 en el índice 2", () => {
  expect(posicionInsertar(nums, 5)).toBe(2);
});

test("no está, va en medio: 2 se inserta en el índice 1", () => {
  expect(posicionInsertar(nums, 2)).toBe(1);
  expect(posicionInsertar(nums, 4)).toBe(2);
});

test("mayor que todos: 7 va al final (índice 4)", () => {
  expect(posicionInsertar(nums, 7)).toBe(4);
});

test("menor que todos: 0 va al inicio (índice 0)", () => {
  expect(posicionInsertar(nums, 0)).toBe(0);
});

test("arreglo vacío: 0", () => {
  expect(posicionInsertar([], 3)).toBe(0);
});

test("un solo elemento: antes, igual o después", () => {
  expect(posicionInsertar([4], 2)).toBe(0);
  expect(posicionInsertar([4], 4)).toBe(0);
  expect(posicionInsertar([4], 9)).toBe(1);
});
