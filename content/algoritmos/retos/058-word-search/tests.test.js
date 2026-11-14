import { test, expect } from "vitest";
import { existePalabra } from "./solucion.js";

const tablero = () => [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"],
];

test("ejemplo clásico: \"ABCCED\" se forma doblando", () => {
  expect(existePalabra(tablero(), "ABCCED")).toBe(true);
});

test("\"SEE\" se forma en la esquina derecha", () => {
  expect(existePalabra(tablero(), "SEE")).toBe(true);
});

test("no se puede reusar una celda: \"ABCB\" da false", () => {
  expect(existePalabra(tablero(), "ABCB")).toBe(false);
});

test("tablero de una celda", () => {
  expect(existePalabra([["a"]], "a")).toBe(true);
  expect(existePalabra([["a"]], "b")).toBe(false);
  expect(existePalabra([["a"]], "aa")).toBe(false);
});

test("las diagonales no conectan", () => {
  const t = [
    ["a", "b"],
    ["c", "d"],
  ];
  expect(existePalabra(t, "ad")).toBe(false);
  expect(existePalabra(t, "abdc")).toBe(true);
});

test("hay que desmarcar al volver: \"AAB\" existe aunque el primer camino falle", () => {
  const t = [
    ["C", "A", "A"],
    ["A", "A", "A"],
    ["B", "C", "D"],
  ];
  expect(existePalabra(t, "AAB")).toBe(true);
});

test("no modifica el tablero original", () => {
  const t = tablero();
  existePalabra(t, "ABCCED");
  existePalabra(t, "ABCB");
  expect(t).toEqual(tablero());
});
