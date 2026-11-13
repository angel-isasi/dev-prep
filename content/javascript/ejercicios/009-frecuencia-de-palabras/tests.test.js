import { test, expect } from "vitest";
import { frecuencia } from "./solucion.js";

test("cuenta las palabras repetidas", () => {
  expect(frecuencia("Ica es Ica")).toEqual({ ica: 2, es: 1 });
});

test("no distingue mayúsculas de minúsculas", () => {
  expect(frecuencia("Hola hola HOLA")).toEqual({ hola: 3 });
});

test("una sola palabra", () => {
  expect(frecuencia("Lima")).toEqual({ lima: 1 });
});

test("ignora espacios dobles y espacios a los costados", () => {
  expect(frecuencia("  a   b  a ")).toEqual({ a: 2, b: 1 });
});

test("texto vacío devuelve un objeto vacío", () => {
  expect(frecuencia("")).toEqual({});
});
