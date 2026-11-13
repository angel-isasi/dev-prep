import { test, expect } from "vitest";
import { crearMultiplicador } from "./solucion.js";

test("devuelve una función", () => {
  expect(typeof crearMultiplicador(3)).toBe("function");
});

test("triple(5) devuelve 15", () => {
  const triple = crearMultiplicador(3);
  expect(triple(5)).toBe(15);
  expect(triple(10)).toBe(30);
});

test("se puede fabricar y llamar en la misma línea", () => {
  expect(crearMultiplicador(10)(2)).toBe(20);
});

test("cada función fabricada recuerda su propio factor", () => {
  const doble = crearMultiplicador(2);
  const triple = crearMultiplicador(3);
  expect(doble(5)).toBe(10);
  expect(triple(5)).toBe(15);
  expect(doble(5)).toBe(10);
});

test("funciona con factor 0 y con negativos", () => {
  expect(crearMultiplicador(0)(99)).toBe(0);
  expect(crearMultiplicador(-1)(4)).toBe(-4);
});
