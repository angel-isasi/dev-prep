import { test, expect } from "vitest";
import { invertir } from "./solucion.js";

test("invierte una palabra", () => {
  expect(invertir("Rimay")).toBe("yamiR");
});

test("invierte también los espacios", () => {
  expect(invertir("hola mundo")).toBe("odnum aloh");
});

test("un solo carácter queda igual", () => {
  expect(invertir("a")).toBe("a");
});

test("un texto vacío devuelve un texto vacío", () => {
  expect(invertir("")).toBe("");
});

test("respeta los emojis", () => {
  expect(invertir("ab😀")).toBe("😀ba");
});
