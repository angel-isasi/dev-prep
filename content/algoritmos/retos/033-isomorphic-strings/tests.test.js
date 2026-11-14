import { test, expect } from "vitest";
import { sonIsomorfas } from "./solucion.js";

test("ejemplo clásico: \"egg\" y \"add\" son isomorfas", () => {
  expect(sonIsomorfas("egg", "add")).toBe(true);
});

test("un carácter no puede ir a dos distintos: \"foo\" y \"bar\" no lo son", () => {
  expect(sonIsomorfas("foo", "bar")).toBe(false);
});

test("palabras más largas: \"paper\" y \"title\" son isomorfas", () => {
  expect(sonIsomorfas("paper", "title")).toBe(true);
});

test("dos caracteres no pueden ir al mismo: \"badc\" y \"baba\" no lo son", () => {
  expect(sonIsomorfas("badc", "baba")).toBe(false);
  expect(sonIsomorfas("ab", "aa")).toBe(false);
});

test("cadenas vacías y de un carácter", () => {
  expect(sonIsomorfas("", "")).toBe(true);
  expect(sonIsomorfas("a", "b")).toBe(true);
});

test("un carácter puede ir a sí mismo: \"abc\" y \"abc\" son isomorfas", () => {
  expect(sonIsomorfas("abc", "abc")).toBe(true);
});

test("el conflicto aparece al final: \"abca\" y \"zyxw\" no lo son", () => {
  expect(sonIsomorfas("abca", "zyxw")).toBe(false);
});
