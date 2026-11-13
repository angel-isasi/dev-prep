import { test, expect } from "vitest";
import { crearContador } from "./solucion.js";

test("suma y resta a partir del valor inicial", () => {
  const c = crearContador(5);
  c.incrementar();
  c.incrementar();
  c.decrementar();
  expect(c.valor()).toBe(6);
});

test("sin valor inicial empieza en 0", () => {
  const c = crearContador();
  expect(c.valor()).toBe(0);
  c.decrementar();
  expect(c.valor()).toBe(-1);
});

test("incrementar y decrementar devuelven el nuevo valor", () => {
  const c = crearContador(10);
  expect(c.incrementar()).toBe(11);
  expect(c.decrementar()).toBe(10);
  expect(c.decrementar()).toBe(9);
});

test("la cuenta es privada: el objeto solo tiene los tres métodos", () => {
  const c = crearContador(5);
  expect(c.cuenta).toBeUndefined();
  expect(Object.keys(c).sort()).toEqual(["decrementar", "incrementar", "valor"]);
});

test("cada contador es independiente", () => {
  const a = crearContador();
  const b = crearContador(100);
  a.incrementar();
  a.incrementar();
  b.decrementar();
  expect(a.valor()).toBe(2);
  expect(b.valor()).toBe(99);
});
