import { test, expect } from "vitest";
import { contarAgotados } from "./solucion.js";

test("las celdas vacías no cuentan como agotadas", () => {
  expect(contarAgotados([5, 0, "", 12, 0])).toBe(2);
});

test("si todas las celdas están vacías no hay agotados", () => {
  expect(contarAgotados(["", "", 3])).toBe(0);
});

test("cuenta todos los ceros", () => {
  expect(contarAgotados([0, 0, 0])).toBe(3);
});

test("sin productos devuelve 0", () => {
  expect(contarAgotados([])).toBe(0);
});
