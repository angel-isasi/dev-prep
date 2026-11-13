import { test, expect } from "vitest";
import { puedeEscribir } from "./solucion.js";

test("la letra no está en la revista: (\"a\", \"b\")", () => {
  expect(puedeEscribir("a", "b")).toBe(false);
});

test("la letra está pero no alcanza: (\"aa\", \"ab\")", () => {
  expect(puedeEscribir("aa", "ab")).toBe(false);
});

test("alcanza justo: (\"aa\", \"aab\")", () => {
  expect(puedeEscribir("aa", "aab")).toBe(true);
});

test("sobran letras y el orden no importa: (\"hola\", \"alohxyz\")", () => {
  expect(puedeEscribir("hola", "alohxyz")).toBe(true);
});

test("nota vacía siempre se puede; revista vacía no alcanza", () => {
  expect(puedeEscribir("", "abc")).toBe(true);
  expect(puedeEscribir("a", "")).toBe(false);
});

test("distingue mayúsculas: (\"A\", \"a\")", () => {
  expect(puedeEscribir("A", "a")).toBe(false);
});
