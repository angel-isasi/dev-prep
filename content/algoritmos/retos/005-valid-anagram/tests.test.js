import { test, expect } from "vitest";
import { esAnagrama } from "./solucion.js";

test("son anagramas: \"anagram\" y \"nagaram\"", () => {
  expect(esAnagrama("anagram", "nagaram")).toBe(true);
});

test("palabras en español: \"roma\" y \"amor\"", () => {
  expect(esAnagrama("roma", "amor")).toBe(true);
});

test("letras distintas: \"rat\" y \"car\"", () => {
  expect(esAnagrama("rat", "car")).toBe(false);
});

test("largos distintos: \"a\" y \"ab\"", () => {
  expect(esAnagrama("a", "ab")).toBe(false);
  expect(esAnagrama("ab", "a")).toBe(false);
});

test("mismas letras pero distintas cantidades: \"aab\" y \"abb\"", () => {
  expect(esAnagrama("aab", "abb")).toBe(false);
});

test("dos cadenas vacías son anagramas", () => {
  expect(esAnagrama("", "")).toBe(true);
});
