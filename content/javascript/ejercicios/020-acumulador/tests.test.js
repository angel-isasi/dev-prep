import { test, expect } from "vitest";
import { crearAcumulador } from "./solucion.js";

test("cada llamada suma al total y lo devuelve", () => {
  const sumar = crearAcumulador();
  expect(sumar(10)).toBe(10);
  expect(sumar(5)).toBe(15);
});

test("un acumulador nuevo empieza en 0", () => {
  expect(crearAcumulador()(1)).toBe(1);
});

test("acepta números negativos", () => {
  const sumar = crearAcumulador();
  sumar(10);
  expect(sumar(-3)).toBe(7);
});

test("dos acumuladores no comparten el total", () => {
  const a = crearAcumulador();
  const b = crearAcumulador();
  a(100);
  expect(b(1)).toBe(1);
  expect(a(1)).toBe(101);
});

test("el total no queda expuesto como propiedad", () => {
  const sumar = crearAcumulador();
  sumar(5);
  expect(sumar.total).toBeUndefined();
});
