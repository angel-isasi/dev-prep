import { test, expect } from "vitest";
import { zip } from "./solucion.js";

test("une dos arreglos del mismo largo", () => {
  expect(zip(["Ana", "Luis"], [18, 15])).toEqual([
    ["Ana", 18],
    ["Luis", 15],
  ]);
});

test("si el primero es más largo, corta en el más corto", () => {
  expect(zip([1, 2, 3], ["a"])).toEqual([[1, "a"]]);
});

test("si el segundo es más largo, también corta en el más corto", () => {
  expect(zip(["x"], [1, 2, 3])).toEqual([["x", 1]]);
});

test("si alguno está vacío devuelve un arreglo vacío", () => {
  expect(zip([], [1, 2])).toEqual([]);
  expect(zip([1, 2], [])).toEqual([]);
});

test("no modifica los arreglos originales", () => {
  const a = [1, 2, 3];
  const b = ["a"];
  zip(a, b);
  expect(a).toEqual([1, 2, 3]);
  expect(b).toEqual(["a"]);
});
