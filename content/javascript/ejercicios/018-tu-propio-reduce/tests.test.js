import { test, expect, vi } from "vitest";
import { reducir } from "./solucion.js";

test("multiplica todos los números", () => {
  expect(reducir([1, 2, 3, 4], (a, b) => a * b, 1)).toBe(24);
});

test("suma todos los números", () => {
  expect(reducir([1, 2, 3, 4], (a, b) => a + b, 0)).toBe(10);
});

test("puede acumular en un objeto", () => {
  const contar = (conteo, letra) => {
    conteo[letra] = (conteo[letra] ?? 0) + 1;
    return conteo;
  };
  expect(reducir(["a", "b", "a"], contar, {})).toEqual({ a: 2, b: 1 });
});

test("llama al callback con (acumulado, elemento, indice)", () => {
  const fn = vi.fn((acc, x) => acc + x);
  reducir([5, 7], fn, 0);
  expect(fn).toHaveBeenCalledTimes(2);
  expect(fn).toHaveBeenNthCalledWith(1, 0, 5, 0);
  expect(fn).toHaveBeenNthCalledWith(2, 5, 7, 1);
});

test("array vacío devuelve el valor inicial sin llamar al callback", () => {
  const fn = vi.fn();
  expect(reducir([], fn, 100)).toBe(100);
  expect(fn).not.toHaveBeenCalled();
});
