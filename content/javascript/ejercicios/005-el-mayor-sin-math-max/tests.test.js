import { test, expect, vi } from "vitest";
import { mayor } from "./solucion.js";

test("encuentra el mayor", () => {
  expect(mayor([3, 9, 2])).toBe(9);
});

test("funciona cuando todos son negativos", () => {
  expect(mayor([-5, -2, -9])).toBe(-2);
});

test("encuentra el mayor al inicio o al final", () => {
  expect(mayor([10, 1, 2])).toBe(10);
  expect(mayor([1, 2, 10])).toBe(10);
});

test("un solo elemento es el mayor", () => {
  expect(mayor([4])).toBe(4);
});

test("un arreglo vacío devuelve undefined", () => {
  expect(mayor([])).toBeUndefined();
});

test("no usa Math.max", () => {
  const espia = vi.spyOn(Math, "max");
  mayor([3, 9, 2]);
  expect(espia).not.toHaveBeenCalled();
  espia.mockRestore();
});
