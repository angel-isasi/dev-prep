import { test, expect } from "vitest";
import { fibonacci, tomar } from "./solucion.js";

test("los primeros 8 números de Fibonacci", () => {
  expect(tomar(fibonacci(), 8)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
});

test("el generador entrega un valor por cada next()", () => {
  const gen = fibonacci();
  expect(gen.next()).toEqual({ value: 0, done: false });
  expect(gen.next()).toEqual({ value: 1, done: false });
  expect(gen.next()).toEqual({ value: 1, done: false });
  expect(gen.next()).toEqual({ value: 2, done: false });
});

test("es infinito: puedes pedir todos los que quieras", () => {
  const veinte = tomar(fibonacci(), 20);
  expect(veinte).toHaveLength(20);
  expect(veinte.at(-1)).toBe(4181);
});

test("tomar 0 valores devuelve un arreglo vacío", () => {
  expect(tomar(fibonacci(), 0)).toEqual([]);
});

test("tomar funciona con cualquier iterable, como un arreglo", () => {
  expect(tomar([10, 20, 30], 2)).toEqual([10, 20]);
  expect(tomar([10, 20], 5)).toEqual([10, 20]);
});
