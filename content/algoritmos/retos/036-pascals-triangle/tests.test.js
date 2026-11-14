import { test, expect } from "vitest";
import { trianguloPascal } from "./solucion.js";

test("ejemplo clásico: 5 filas", () => {
  expect(trianguloPascal(5)).toEqual([
    [1],
    [1, 1],
    [1, 2, 1],
    [1, 3, 3, 1],
    [1, 4, 6, 4, 1],
  ]);
});

test("una sola fila: [[1]]", () => {
  expect(trianguloPascal(1)).toEqual([[1]]);
});

test("dos filas: la segunda no tiene números en el medio", () => {
  expect(trianguloPascal(2)).toEqual([[1], [1, 1]]);
});

test("cero filas: []", () => {
  expect(trianguloPascal(0)).toEqual([]);
});

test("la fila 6 es [1, 5, 10, 10, 5, 1]", () => {
  const triangulo = trianguloPascal(6);
  expect(triangulo.length).toBe(6);
  expect(triangulo[5]).toEqual([1, 5, 10, 10, 5, 1]);
});

test("con 10 filas, cada fila i tiene i + 1 elementos y la última es correcta", () => {
  const triangulo = trianguloPascal(10);
  triangulo.forEach((fila, i) => expect(fila.length).toBe(i + 1));
  expect(triangulo[9]).toEqual([1, 9, 36, 84, 126, 126, 84, 36, 9, 1]);
});
