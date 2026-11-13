import { test, expect } from "vitest";
import { moverCeros } from "./solucion.js";

test("ejemplo clásico: [0, 1, 0, 3, 12]", () => {
  expect(moverCeros([0, 1, 0, 3, 12])).toEqual([1, 3, 12, 0, 0]);
});

test("modifica el mismo arreglo y lo devuelve", () => {
  const nums = [0, 5];
  const resultado = moverCeros(nums);
  expect(resultado).toBe(nums);
  expect(nums).toEqual([5, 0]);
});

test("sin ceros o con un solo cero no cambia nada", () => {
  expect(moverCeros([1, 2])).toEqual([1, 2]);
  expect(moverCeros([0])).toEqual([0]);
});

test("solo ceros: [0, 0, 0]", () => {
  expect(moverCeros([0, 0, 0])).toEqual([0, 0, 0]);
});

test("ceros seguidos al inicio: [0, 0, 1] (rompe el splice dentro del bucle)", () => {
  expect(moverCeros([0, 0, 1])).toEqual([1, 0, 0]);
});

test("mantiene el orden con negativos: [0, -1, 0, 2, -3]", () => {
  expect(moverCeros([0, -1, 0, 2, -3])).toEqual([-1, 2, -3, 0, 0]);
});
