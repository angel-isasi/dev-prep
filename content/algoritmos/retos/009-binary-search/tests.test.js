import { test, expect } from "vitest";
import { busquedaBinaria } from "./solucion.js";

const nums = [-1, 0, 3, 5, 9, 12];

test("encuentra un valor que está: 9 en el índice 4", () => {
  expect(busquedaBinaria(nums, 9)).toBe(4);
});

test("devuelve -1 si el valor no está: 2", () => {
  expect(busquedaBinaria(nums, 2)).toBe(-1);
});

test("encuentra el primero y el último", () => {
  expect(busquedaBinaria(nums, -1)).toBe(0);
  expect(busquedaBinaria(nums, 12)).toBe(5);
});

test("menor que todos o mayor que todos: -1", () => {
  expect(busquedaBinaria(nums, -5)).toBe(-1);
  expect(busquedaBinaria(nums, 100)).toBe(-1);
});

test("un solo elemento: lo encuentra si está", () => {
  expect(busquedaBinaria([5], 5)).toBe(0);
  expect(busquedaBinaria([5], 3)).toBe(-1);
});

test("arreglo vacío: -1", () => {
  expect(busquedaBinaria([], 1)).toBe(-1);
});
