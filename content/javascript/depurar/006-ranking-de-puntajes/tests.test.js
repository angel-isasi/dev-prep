import { test, expect } from "vitest";
import { mejoresPuntajes } from "./solucion.js";

test("el 100 va primero y el 9 no entra al top 3", () => {
  expect(mejoresPuntajes([80, 100, 9, 45], 3)).toEqual([100, 80, 45]);
});

test("ordena bien puntajes con distinta cantidad de cifras", () => {
  expect(mejoresPuntajes([5, 1000, 20, 300], 4)).toEqual([1000, 300, 20, 5]);
});

test("funciona con puntajes de dos cifras", () => {
  expect(mejoresPuntajes([30, 10, 20], 2)).toEqual([30, 20]);
});

test("no modifica el arreglo original", () => {
  const puntajes = [80, 100, 9];
  mejoresPuntajes(puntajes, 2);
  expect(puntajes).toEqual([80, 100, 9]);
});
