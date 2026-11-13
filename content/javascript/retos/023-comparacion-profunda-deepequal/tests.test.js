import { test, expect } from "vitest";
import { iguales } from "./solucion.js";

test("objetos anidados con el mismo contenido son iguales", () => {
  expect(iguales({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
  expect(iguales({ a: 1, b: 2 }, { b: 2, a: 1 }), "el orden de las claves no importa").toBe(true);
});

test("una clave de más o un valor distinto los hace diferentes", () => {
  expect(iguales({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  expect(iguales({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  expect(iguales({ a: { b: [1, 2] } }, { a: { b: [1, 3] } })).toBe(false);
});

test("misma cantidad de claves pero con nombres distintos no son iguales", () => {
  expect(iguales({ a: undefined }, { b: undefined })).toBe(false);
});

test("un arreglo nunca es igual a un objeto", () => {
  expect(iguales([1, 2], { 0: 1, 1: 2 })).toBe(false);
  expect(iguales([1, 2], [1, 2])).toBe(true);
  expect(iguales([1, 2], [2, 1]), "en arreglos el orden sí importa").toBe(false);
});

test("primitivos y null", () => {
  expect(iguales(null, null)).toBe(true);
  expect(iguales(null, {})).toBe(false);
  expect(iguales({}, null)).toBe(false);
  expect(iguales(1, "1")).toBe(false);
  expect(iguales("Ica", "Ica")).toBe(true);
});
