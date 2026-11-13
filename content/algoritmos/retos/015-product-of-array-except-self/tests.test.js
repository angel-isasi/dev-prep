import { test, expect } from "vitest";
import { productoExceptoYo } from "./solucion.js";

// Multiplicar 0 por un negativo da -0 en JavaScript, y toEqual distingue 0 de -0.
// Sumar 0 convierte cualquier -0 en 0, así comparamos solo el valor.
const sinMenosCero = (arr) => arr.map((x) => x + 0);

test("ejemplo clásico: [1, 2, 3, 4]", () => {
  expect(productoExceptoYo([1, 2, 3, 4])).toEqual([24, 12, 8, 6]);
});

test("con un cero: [-1, 1, 0, -3, 3]", () => {
  expect(sinMenosCero(productoExceptoYo([-1, 1, 0, -3, 3]))).toEqual([0, 0, 9, 0, 0]);
});

test("el cero en la primera posición (rompe la idea de dividir): [0, 4, 5]", () => {
  expect(sinMenosCero(productoExceptoYo([0, 4, 5]))).toEqual([20, 0, 0]);
});

test("dos ceros: todo da 0", () => {
  expect(sinMenosCero(productoExceptoYo([0, 2, 0]))).toEqual([0, 0, 0]);
});

test("solo dos elementos: [3, 4]", () => {
  expect(productoExceptoYo([3, 4])).toEqual([4, 3]);
});

test("todos negativos y no modifica el original", () => {
  const nums = [-1, -2, -3];
  expect(productoExceptoYo(nums)).toEqual([6, 3, 2]);
  expect(nums).toEqual([-1, -2, -3]);
});
