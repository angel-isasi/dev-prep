import { test, expect } from "vitest";
import { esPalindromo } from "./solucion.js";

test("ignora mayúsculas, espacios y signos: \"A man, a plan, a canal: Panama\"", () => {
  expect(esPalindromo("A man, a plan, a canal: Panama")).toBe(true);
});

test("frase en español: \"Anita lava la tina\"", () => {
  expect(esPalindromo("Anita lava la tina")).toBe(true);
});

test("no es palíndromo: \"race a car\"", () => {
  expect(esPalindromo("race a car")).toBe(false);
});

test("sin caracteres válidos es palíndromo: \" \" y \"\"", () => {
  expect(esPalindromo(" ")).toBe(true);
  expect(esPalindromo("")).toBe(true);
});

test("un solo carácter: \"a\" y \"?a!\"", () => {
  expect(esPalindromo("a")).toBe(true);
  expect(esPalindromo("?a!")).toBe(true);
});

test("los dígitos cuentan: \"0P\" no es palíndromo y \"1a2a1\" sí", () => {
  expect(esPalindromo("0P")).toBe(false);
  expect(esPalindromo("1a2a1")).toBe(true);
});
