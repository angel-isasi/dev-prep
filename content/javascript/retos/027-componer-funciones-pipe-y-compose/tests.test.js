import { test, expect, vi } from "vitest";
import { pipe, compose } from "./solucion.js";

const limpiar = (s) => s.trim();
const minus = (s) => s.toLowerCase();
const slug = (s) => s.replace(/\s+/g, "-");
const sumar1 = (n) => n + 1;
const doble = (n) => n * 2;

test("pipe aplica las funciones de izquierda a derecha", () => {
  expect(pipe(limpiar, minus, slug)("  Festival de Cortos ")).toBe("festival-de-cortos");
  expect(pipe(sumar1, doble)(5), "(5 + 1) * 2").toBe(12);
});

test("compose aplica las funciones de derecha a izquierda", () => {
  expect(compose(slug, minus, limpiar)("  Hola Mundo ")).toBe("hola-mundo");
  expect(compose(sumar1, doble)(5), "(5 * 2) + 1").toBe(11);
});

test("sin funciones, devuelven el valor tal cual", () => {
  expect(pipe()(7)).toBe(7);
  expect(compose()("hola")).toBe("hola");
});

test("no ejecutan nada hasta recibir el valor", () => {
  const espia = vi.fn((x) => x);
  const compuesta = pipe(espia, espia);
  expect(espia, "pipe solo prepara la función").not.toHaveBeenCalled();
  expect(compuesta(1)).toBe(1);
  expect(espia).toHaveBeenCalledTimes(2);
});

test("la función compuesta se puede reutilizar", () => {
  const precioFinal = pipe(doble, sumar1);
  expect(precioFinal(1)).toBe(3);
  expect(precioFinal(10)).toBe(21);
});
