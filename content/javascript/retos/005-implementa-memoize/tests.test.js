import { test, expect, vi } from "vitest";
import { memoize } from "./solucion.js";

test("con el mismo argumento, calcula una sola vez", () => {
  const fn = vi.fn((n) => n * n);
  const cuadrado = memoize(fn);
  expect(cuadrado(4)).toBe(16);
  expect(cuadrado(4)).toBe(16);
  expect(cuadrado(4)).toBe(16);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("argumentos distintos se calculan por separado", () => {
  const fn = vi.fn((n) => n * n);
  const cuadrado = memoize(fn);
  expect(cuadrado(2)).toBe(4);
  expect(cuadrado(3)).toBe(9);
  expect(cuadrado(2)).toBe(4);
  expect(fn).toHaveBeenCalledTimes(2);
});

test("funciona con varios argumentos y respeta su orden", () => {
  const fn = vi.fn((a, b) => a - b);
  const restar = memoize(fn);
  expect(restar(10, 3)).toBe(7);
  expect(restar(3, 10)).toBe(-7);
  expect(restar(10, 3)).toBe(7);
  expect(fn).toHaveBeenCalledTimes(2);
});

test("también recuerda resultados falsy como 0 o undefined", () => {
  const cero = vi.fn(() => 0);
  const nada = vi.fn(() => undefined);
  const memoCero = memoize(cero);
  const memoNada = memoize(nada);
  memoCero("a");
  memoCero("a");
  memoNada("a");
  memoNada("a");
  expect(cero, "el 0 también debe salir de la caché").toHaveBeenCalledTimes(1);
  expect(nada, "undefined también debe salir de la caché").toHaveBeenCalledTimes(1);
});

test("cada función memoizada tiene su propia caché", () => {
  const doble = memoize((n) => n * 2);
  const triple = memoize((n) => n * 3);
  expect(doble(5)).toBe(10);
  expect(triple(5)).toBe(15);
});
