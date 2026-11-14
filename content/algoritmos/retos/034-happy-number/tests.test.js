import { test, expect } from "vitest";
import { esFeliz } from "./solucion.js";

test("ejemplo clásico: 19 es feliz", () => {
  expect(esFeliz(19)).toBe(true);
});

test("2 no es feliz: cae en un ciclo", () => {
  expect(esFeliz(2)).toBe(false);
});

test("el 1 ya es feliz", () => {
  expect(esFeliz(1)).toBe(true);
});

test("camino más largo: 7 es feliz (7 -> 49 -> 97 -> 130 -> 10 -> 1)", () => {
  expect(esFeliz(7)).toBe(true);
});

test("el 4 es parte del ciclo, así que no es feliz", () => {
  expect(esFeliz(4)).toBe(false);
});

test("con ceros entre los dígitos: 100 y 10 son felices", () => {
  expect(esFeliz(100)).toBe(true);
  expect(esFeliz(10)).toBe(true);
});

test("entra al ciclo por otro número: 116 no es feliz", () => {
  expect(esFeliz(116)).toBe(false);
});
