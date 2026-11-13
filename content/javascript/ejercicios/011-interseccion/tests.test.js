import { test, expect } from "vitest";
import { interseccion } from "./solucion.js";

test("devuelve los comunes sin repetir", () => {
  expect(interseccion([1, 2, 2, 3], [2, 3, 4])).toEqual([2, 3]);
});

test("respeta el orden del primer arreglo", () => {
  expect(interseccion([3, 1, 2], [1, 2, 3])).toEqual([3, 1, 2]);
});

test("funciona con textos", () => {
  expect(interseccion(["ana", "luis"], ["luis", "eva"])).toEqual(["luis"]);
});

test("sin elementos en común devuelve un arreglo vacío", () => {
  expect(interseccion([1, 2], [3, 4])).toEqual([]);
  expect(interseccion([], [1, 2])).toEqual([]);
});

test("no modifica los arreglos originales", () => {
  const a = [1, 2, 2, 3];
  const b = [2, 3, 4];
  interseccion(a, b);
  expect(a).toEqual([1, 2, 2, 3]);
  expect(b).toEqual([2, 3, 4]);
});
