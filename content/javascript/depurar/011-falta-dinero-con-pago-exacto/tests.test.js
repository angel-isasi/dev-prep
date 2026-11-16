import { test, expect } from "vitest";
import { pagoCompleto } from "./solucion.js";

test("S/ 1.10 + S/ 2.20 pagado con S/ 3.30 alcanza", () => {
  expect(pagoCompleto([1.1, 2.2], 3.3)).toBe(true);
});

test("S/ 0.10 + S/ 0.20 pagado con S/ 0.30 alcanza", () => {
  expect(pagoCompleto([0.1, 0.2], 0.3)).toBe(true);
});

test("si paga de más, alcanza", () => {
  expect(pagoCompleto([12.5, 7.5], 50)).toBe(true);
});

test("si falta un céntimo, no alcanza", () => {
  expect(pagoCompleto([10.5], 10.49)).toBe(false);
});

test("una compra sin productos se cubre con 0", () => {
  expect(pagoCompleto([], 0)).toBe(true);
});
