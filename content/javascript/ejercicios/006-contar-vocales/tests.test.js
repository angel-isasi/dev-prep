import { test, expect } from "vitest";
import { contarVocales } from "./solucion.js";

test("cuenta vocales con y sin tilde", () => {
  expect(contarVocales("Arqueología")).toBe(7);
});

test("un texto sin vocales devuelve 0", () => {
  expect(contarVocales("xyz")).toBe(0);
});

test("un texto vacío devuelve 0", () => {
  expect(contarVocales("")).toBe(0);
});

test("cuenta las mayúsculas", () => {
  expect(contarVocales("AEIOU")).toBe(5);
});

test("cuenta las tildes en varias palabras e ignora los espacios", () => {
  expect(contarVocales("canción árbol")).toBe(5);
});

test("cuenta la ü", () => {
  expect(contarVocales("pingüino")).toBe(4);
});
