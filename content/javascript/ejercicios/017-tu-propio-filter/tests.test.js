import { test, expect } from "vitest";
import { filtrar } from "./solucion.js";

test("se queda con las palabras de 3 letras", () => {
  expect(filtrar(["sol", "arena", "mar"], (p) => p.length === 3)).toEqual(["sol", "mar"]);
});

test("se queda con los números pares", () => {
  expect(filtrar([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([2, 4]);
});

test("le pasa el índice al callback", () => {
  expect(filtrar(["a", "b", "c", "d"], (letra, i) => i % 2 === 0)).toEqual(["a", "c"]);
});

test("acepta valores truthy y falsy, no solo true y false", () => {
  expect(filtrar([0, 1, "", "hola", null, 5], (x) => x)).toEqual([1, "hola", 5]);
});

test("si ninguno cumple devuelve []", () => {
  expect(filtrar([1, 2, 3], (n) => n > 10)).toEqual([]);
  expect(filtrar([], () => true)).toEqual([]);
});

test("no modifica el array original", () => {
  const original = [1, 2, 3, 4];
  filtrar(original, (n) => n > 2);
  expect(original).toEqual([1, 2, 3, 4]);
});
