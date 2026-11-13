import { test, expect } from "vitest";
import { sumarTodos } from "./solucion.js";

test("suma varios números", () => {
  expect(sumarTodos(1, 2, 3)).toBe(6);
  expect(sumarTodos(10, -4, 0.5)).toBe(6.5);
});

test("con un solo número lo devuelve", () => {
  expect(sumarTodos(10)).toBe(10);
});

test("sin argumentos devuelve 0", () => {
  expect(sumarTodos()).toBe(0);
});

test("acepta un array desarmado con spread", () => {
  const notas = [12, 15, 18];
  expect(sumarTodos(...notas)).toBe(45);
});

test("acepta muchos argumentos", () => {
  expect(sumarTodos(1, 1, 1, 1, 1, 1, 1, 1, 1, 1)).toBe(10);
});
