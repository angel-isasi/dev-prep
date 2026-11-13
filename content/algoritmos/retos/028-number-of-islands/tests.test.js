import { test, expect } from "vitest";
import { contarIslas } from "./solucion.js";

test("ejemplo clásico: 3 islas", () => {
  const grilla = [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
  ];
  expect(contarIslas(grilla)).toBe(3);
});

test("solo agua y grilla vacía: 0", () => {
  expect(contarIslas([["0"]])).toBe(0);
  expect(contarIslas([])).toBe(0);
});

test("las diagonales no conectan: 2 islas", () => {
  expect(
    contarIslas([
      ["1", "0"],
      ["0", "1"],
    ]),
  ).toBe(2);
});

test("una isla con forma de U cuenta una sola vez", () => {
  const grilla = [
    ["1", "0", "1"],
    ["1", "0", "1"],
    ["1", "1", "1"],
  ];
  expect(contarIslas(grilla)).toBe(1);
});

test("toda la grilla es tierra: 1 isla", () => {
  expect(
    contarIslas([
      ["1", "1"],
      ["1", "1"],
    ]),
  ).toBe(1);
});

test("no modifica la grilla original", () => {
  const grilla = [
    ["1", "0"],
    ["1", "1"],
  ];
  contarIslas(grilla);
  expect(grilla).toEqual([
    ["1", "0"],
    ["1", "1"],
  ]);
});
