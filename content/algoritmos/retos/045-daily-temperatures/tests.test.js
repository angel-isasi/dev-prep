import { test, expect } from "vitest";
import { temperaturasDiarias } from "./solucion.js";

test("ejemplo clásico: [73, 74, 75, 71, 69, 72, 76, 73]", () => {
  expect(temperaturasDiarias([73, 74, 75, 71, 69, 72, 76, 73])).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
});

test("siempre sube: [30, 40, 50, 60]", () => {
  expect(temperaturasDiarias([30, 40, 50, 60])).toEqual([1, 1, 1, 0]);
});

test("siempre baja: [90, 80, 70] da todo 0", () => {
  expect(temperaturasDiarias([90, 80, 70])).toEqual([0, 0, 0]);
});

test("una temperatura igual no es más cálida: [70, 70, 70, 71]", () => {
  expect(temperaturasDiarias([70, 70, 70, 71])).toEqual([3, 2, 1, 0]);
});

test("un día caluroso responde a varios de golpe", () => {
  expect(temperaturasDiarias([55, 38, 53, 81, 61, 93, 97, 32, 43, 78])).toEqual([3, 1, 1, 2, 1, 1, 0, 1, 1, 0]);
});

test("vacío y un solo día", () => {
  expect(temperaturasDiarias([])).toEqual([]);
  expect(temperaturasDiarias([50])).toEqual([0]);
});

test("no modifica el arreglo original", () => {
  const temperaturas = [30, 20, 40];
  temperaturasDiarias(temperaturas);
  expect(temperaturas).toEqual([30, 20, 40]);
});
