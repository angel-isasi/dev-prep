import { test, expect } from "vitest";
import { esValido } from "./solucion.js";

test("pares simples seguidos y cadena vacía son válidos", () => {
  expect(esValido("()[]{}")).toBe(true);
  expect(esValido("")).toBe(true);
});

test("paréntesis anidados correctamente: \"([])\" y \"{[()]}\"", () => {
  expect(esValido("([])")).toBe(true);
  expect(esValido("{[()]}")).toBe(true);
});

test("se cierra con otro tipo: \"(]\"", () => {
  expect(esValido("(]")).toBe(false);
});

test("cruzados: \"([)]\" no es válido aunque las cantidades cuadren", () => {
  expect(esValido("([)]")).toBe(false);
});

test("quedan paréntesis abiertos: \"((\" y \"({}\"", () => {
  expect(esValido("((")).toBe(false);
  expect(esValido("({}")).toBe(false);
});

test("cierre sin apertura: \"]\" y \"())\"", () => {
  expect(esValido("]")).toBe(false);
  expect(esValido("())")).toBe(false);
});
