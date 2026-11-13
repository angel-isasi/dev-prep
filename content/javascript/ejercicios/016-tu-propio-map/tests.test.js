import { test, expect, vi } from "vitest";
import { mapear } from "./solucion.js";

test("transforma cada número", () => {
  expect(mapear([1, 2, 3], (n) => n * 2)).toEqual([2, 4, 6]);
});

test("le pasa el índice al callback", () => {
  expect(mapear([1, 2, 3], (n, i) => n * i)).toEqual([0, 2, 6]);
});

test("funciona con textos", () => {
  expect(mapear(["ica", "lima"], (s) => s.toUpperCase())).toEqual(["ICA", "LIMA"]);
});

test("llama al callback con (elemento, indice, lista)", () => {
  const lista = ["a", "b"];
  const fn = vi.fn((x) => x);
  mapear(lista, fn);
  expect(fn).toHaveBeenCalledTimes(2);
  expect(fn).toHaveBeenNthCalledWith(1, "a", 0, lista);
  expect(fn).toHaveBeenNthCalledWith(2, "b", 1, lista);
});

test("no modifica el array original y devuelve uno nuevo", () => {
  const original = [1, 2, 3];
  const resultado = mapear(original, (n) => n + 1);
  expect(original).toEqual([1, 2, 3]);
  expect(resultado).not.toBe(original);
});

test("array vacío devuelve [] sin llamar al callback", () => {
  const fn = vi.fn();
  expect(mapear([], fn)).toEqual([]);
  expect(fn).not.toHaveBeenCalled();
});
