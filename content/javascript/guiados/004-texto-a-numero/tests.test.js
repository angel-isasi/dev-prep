import { test, expect } from "vitest";
import { aNumero } from "./solucion.js";

test("convierte enteros, negativos y decimales", () => {
  expect(aNumero("42")).toBe(42);
  expect(aNumero("-7")).toBe(-7);
  expect(aNumero("3.5")).toBe(3.5);
});

test("ignora los espacios a los costados", () => {
  expect(aNumero("  15 ")).toBe(15);
});

test("el texto \"0\" es el número 0, no null", () => {
  expect(aNumero("0")).toBe(0);
});

test("texto vacío o solo con espacios devuelve null", () => {
  expect(aNumero("")).toBe(null);
  expect(aNumero("   ")).toBe(null);
});

test("texto que no es número devuelve null", () => {
  expect(aNumero("hola")).toBe(null);
  expect(aNumero("12abc")).toBe(null);
});
