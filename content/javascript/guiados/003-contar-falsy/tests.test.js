import { test, expect } from "vitest";
import { contarFalsy } from "./solucion.js";

test("reconoce los valores falsy", () => {
  expect(contarFalsy([false, 0, -0, "", null, undefined, NaN])).toBe(7);
});

test("no confunde valores que parecen falsos pero son truthy", () => {
  expect(contarFalsy(["0", "false", " ", [], {}, -1])).toBe(0);
});

test("cuenta solo los falsy en un array mezclado", () => {
  expect(contarFalsy([0, 1, "", "hola", null, { a: 1 }, NaN])).toBe(4);
});

test("array vacío devuelve 0", () => {
  expect(contarFalsy([])).toBe(0);
});

test("no modifica el array original", () => {
  const valores = [0, 1, ""];
  contarFalsy(valores);
  expect(valores).toEqual([0, 1, ""]);
});
