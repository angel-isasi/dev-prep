import { test, expect } from "vitest";
import { stockDe } from "./solucion.js";

test("devuelve el stock cuando existe", () => {
  expect(stockDe({ nombre: "Polo", inventario: { stock: 15 } })).toBe(15);
});

test("un stock de 0 es válido, no se convierte en null", () => {
  expect(stockDe({ nombre: "Gorra", inventario: { stock: 0 } })).toBe(0);
});

test("si falta el inventario devuelve null", () => {
  expect(stockDe({ nombre: "Casaca" })).toBe(null);
});

test("si el inventario no trae stock devuelve null", () => {
  expect(stockDe({ nombre: "Medias", inventario: {} })).toBe(null);
});

test("si el producto es null o undefined devuelve null sin lanzar error", () => {
  expect(stockDe(null)).toBe(null);
  expect(stockDe(undefined)).toBe(null);
});
