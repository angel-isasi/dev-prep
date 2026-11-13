import { test, expect } from "vitest";
import { componer } from "./solucion.js";

const sinEspacios = (s) => s.trim();
const gritar = (s) => s.toUpperCase() + "!";
const sumar1 = (n) => n + 1;
const doble = (n) => n * 2;

test("devuelve una función", () => {
  expect(typeof componer(gritar, sinEspacios)).toBe("function");
});

test("limpia y luego grita", () => {
  expect(componer(gritar, sinEspacios)("  ica ")).toBe("ICA!");
});

test("aplica primero g y después f", () => {
  expect(componer(doble, sumar1)(5)).toBe(12);
});

test("el orden importa", () => {
  expect(componer(sumar1, doble)(5)).toBe(11);
});

test("la función compuesta se puede reutilizar", () => {
  const sumar1YDuplicar = componer(doble, sumar1);
  expect(sumar1YDuplicar(0)).toBe(2);
  expect(sumar1YDuplicar(10)).toBe(22);
});
