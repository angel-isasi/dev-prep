import { test, expect } from "vitest";
import { buscarEnRotado } from "./solucion.js";

test("ejemplo clásico: el 0 está en la posición 4", () => {
  expect(buscarEnRotado([4, 5, 6, 7, 0, 1, 2], 0)).toBe(4);
});

test("no está: devuelve -1", () => {
  expect(buscarEnRotado([4, 5, 6, 7, 0, 1, 2], 3)).toBe(-1);
  expect(buscarEnRotado([4, 5, 6, 7, 0, 1, 2], 8)).toBe(-1);
});

test("el objetivo está en el tramo de la izquierda: el 5 está en la posición 1", () => {
  expect(buscarEnRotado([4, 5, 6, 7, 0, 1, 2], 5)).toBe(1);
});

test("un elemento y arreglo vacío", () => {
  expect(buscarEnRotado([1], 1)).toBe(0);
  expect(buscarEnRotado([1], 0)).toBe(-1);
  expect(buscarEnRotado([], 5)).toBe(-1);
});

test("dos elementos rotados: [3, 1] busca el 1", () => {
  expect(buscarEnRotado([3, 1], 1)).toBe(1);
  expect(buscarEnRotado([3, 1], 3)).toBe(0);
});

test("sin rotar funciona como búsqueda binaria normal", () => {
  expect(buscarEnRotado([1, 3, 5, 7, 9], 7)).toBe(3);
  expect(buscarEnRotado([1, 3, 5, 7, 9], 1)).toBe(0);
});

test("objetivos en los bordes: [5, 1, 3]", () => {
  expect(buscarEnRotado([5, 1, 3], 5)).toBe(0);
  expect(buscarEnRotado([5, 1, 3], 3)).toBe(2);
});

test("rotado cerca del final: [6, 7, 8, 9, 10, 1, 2]", () => {
  expect(buscarEnRotado([6, 7, 8, 9, 10, 1, 2], 2)).toBe(6);
  expect(buscarEnRotado([6, 7, 8, 9, 10, 1, 2], 8)).toBe(2);
});
