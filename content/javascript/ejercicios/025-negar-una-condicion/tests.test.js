import { test, expect } from "vitest";
import { negar } from "./solucion.js";

const esPar = (n) => n % 2 === 0;

test("sirve con filter para quedarse con los impares", () => {
  expect([1, 2, 3, 4].filter(negar(esPar))).toEqual([1, 3]);
});

test("devuelve lo contrario del predicado", () => {
  const esImpar = negar(esPar);
  expect(esImpar(3)).toBe(true);
  expect(esImpar(4)).toBe(false);
});

test("pasa todos los argumentos al predicado", () => {
  const esMayor = (a, b) => a > b;
  expect(negar(esMayor)(5, 2)).toBe(false);
  expect(negar(esMayor)(1, 9)).toBe(true);
});

test("siempre devuelve un booleano, aunque el predicado devuelva otra cosa", () => {
  const identidad = (x) => x;
  expect(negar(identidad)("")).toBe(true);
  expect(negar(identidad)("hola")).toBe(false);
});

test("no modifica la función original", () => {
  negar(esPar);
  expect(esPar(4)).toBe(true);
});
