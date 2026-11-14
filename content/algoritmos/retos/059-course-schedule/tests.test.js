import { test, expect } from "vitest";
import { puedeTerminarCursos } from "./solucion.js";

test("ejemplo clásico: [[1, 0]] se puede (0 y luego 1)", () => {
  expect(puedeTerminarCursos(2, [[1, 0]])).toBe(true);
});

test("círculo de dos cursos: imposible", () => {
  expect(puedeTerminarCursos(2, [[1, 0], [0, 1]])).toBe(false);
});

test("sin requisitos: siempre se puede", () => {
  expect(puedeTerminarCursos(3, [])).toBe(true);
  expect(puedeTerminarCursos(1, [])).toBe(true);
});

test("un curso que se pide a sí mismo: imposible", () => {
  expect(puedeTerminarCursos(1, [[0, 0]])).toBe(false);
});

test("cadena larga sin círculo: 0, 1, 2, 3", () => {
  expect(puedeTerminarCursos(4, [[1, 0], [2, 1], [3, 2]])).toBe(true);
});

test("círculo de tres cursos detrás de un curso libre: imposible", () => {
  expect(puedeTerminarCursos(4, [[1, 0], [2, 1], [3, 2], [1, 3]])).toBe(false);
});

test("rombo: dos caminos llegan al mismo curso, pero no es un círculo", () => {
  const prerrequisitos = [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]];
  expect(puedeTerminarCursos(5, prerrequisitos)).toBe(true);
});

test("dos grupos separados, uno con círculo: imposible", () => {
  expect(puedeTerminarCursos(6, [[1, 0], [3, 2], [4, 3], [2, 4]])).toBe(false);
});
