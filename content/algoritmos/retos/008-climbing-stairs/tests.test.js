import { test, expect } from "vitest";
import { formasDeSubir } from "./solucion.js";

test("un escalón: 1 forma", () => {
  expect(formasDeSubir(1)).toBe(1);
});

test("dos escalones: 2 formas", () => {
  expect(formasDeSubir(2)).toBe(2);
});

test("tres escalones: 3 formas", () => {
  expect(formasDeSubir(3)).toBe(3);
});

test("cinco escalones: 8 formas", () => {
  expect(formasDeSubir(5)).toBe(8);
});

test("diez escalones: 89 formas", () => {
  expect(formasDeSubir(10)).toBe(89);
});

// Ojo: si usas recursión sin memoria, este test puede tardar varios segundos en fallar.
test("45 escalones en menos de 1 segundo (la recursión sin memoria tarda demasiado)", () => {
  const inicio = performance.now();
  const resultado = formasDeSubir(45);
  const milisegundos = performance.now() - inicio;
  expect(resultado).toBe(1836311903);
  expect(milisegundos).toBeLessThan(1000);
});
