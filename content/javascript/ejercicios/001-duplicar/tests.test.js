import { test, expect } from "vitest";
import { duplicar } from "./solucion.js";

test("duplica cada número", () => {
  expect(duplicar([1, 2, 3])).toEqual([2, 4, 6]);
});

test("funciona con negativos y con cero", () => {
  expect(duplicar([-1, 0, 5])).toEqual([-2, 0, 10]);
});

test("un arreglo vacío devuelve un arreglo vacío", () => {
  expect(duplicar([])).toEqual([]);
});

test("no modifica el arreglo original y devuelve uno nuevo", () => {
  const notas = [10, 12];
  const resultado = duplicar(notas);
  expect(notas).toEqual([10, 12]);
  expect(resultado).not.toBe(notas);
});
