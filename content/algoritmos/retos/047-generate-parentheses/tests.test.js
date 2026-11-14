import { test, expect } from "vitest";
import { generarParentesis } from "./solucion.js";

// El orden no importa: ordeno (una copia) antes de comparar.
const ordenar = (lista) => [...lista].sort();

// ¿Está bien formada? Nunca cierra más de lo que abrió y al final queda en 0.
function bienFormada(texto) {
  let balance = 0;
  for (const c of texto) {
    balance += c === "(" ? 1 : -1;
    if (balance < 0) return false;
  }
  return balance === 0;
}

test("n = 1 da [\"()\"]", () => {
  expect(ordenar(generarParentesis(1))).toEqual(["()"]);
});

test("n = 2 da \"(())\" y \"()()\"", () => {
  expect(ordenar(generarParentesis(2))).toEqual(["(())", "()()"]);
});

test("n = 3 da las 5 combinaciones", () => {
  expect(ordenar(generarParentesis(3))).toEqual(["((()))", "(()())", "(())()", "()(())", "()()()"]);
});

test("n = 4 da 14 combinaciones y n = 5 da 42, sin repetidos", () => {
  const cuatro = generarParentesis(4);
  const cinco = generarParentesis(5);
  expect(cuatro).toHaveLength(14);
  expect(new Set(cuatro).size).toBe(14);
  expect(cinco).toHaveLength(42);
  expect(new Set(cinco).size).toBe(42);
});

test("con n = 4, todas tienen largo 8 y están bien formadas", () => {
  for (const texto of generarParentesis(4)) {
    expect(texto).toHaveLength(8);
    expect(bienFormada(texto)).toBe(true);
  }
});
