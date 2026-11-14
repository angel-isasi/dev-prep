import { test, expect } from "vitest";
import { cambioMonedas } from "./solucion.js";

test("ejemplo clásico: [1, 2, 5] con monto 11 da 3 (5 + 5 + 1)", () => {
  expect(cambioMonedas([1, 2, 5], 11)).toBe(3);
});

test("imposible: con monedas de 2 no se forma 3, da -1", () => {
  expect(cambioMonedas([2], 3)).toBe(-1);
});

test("monto 0 se forma con 0 monedas", () => {
  expect(cambioMonedas([1], 0)).toBe(0);
  expect(cambioMonedas([5, 10], 0)).toBe(0);
});

test("tomar siempre la moneda más grande falla: [1, 3, 4] con 6 da 2 (3 + 3)", () => {
  expect(cambioMonedas([1, 3, 4], 6)).toBe(2);
});

test("la moneda grande lleva a un callejón: [2, 5] con 8 da 4 (2 + 2 + 2 + 2)", () => {
  expect(cambioMonedas([2, 5], 8)).toBe(4);
});

test("las monedas pueden venir desordenadas: [2, 5, 10, 1] con 27 da 4", () => {
  expect(cambioMonedas([2, 5, 10, 1], 27)).toBe(4);
});

test("todas las monedas son más grandes que el monto: -1", () => {
  expect(cambioMonedas([5, 10], 3)).toBe(-1);
});
