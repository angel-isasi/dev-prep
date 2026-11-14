import { test, expect } from "vitest";
import { combinacionesQueSuman } from "./solucion.js";

// El orden no importa: ordeno cada combinación, la convierto en texto
// ("2,2,3") y ordeno la lista. Si devuelves [2, 3] y [3, 2], quedan dos "2,3".
const normalizar = (lista) => lista.map((c) => [...c].sort((a, b) => a - b).join(",")).sort();

test("ejemplo clásico: [2, 3, 6, 7] y 7", () => {
  expect(normalizar(combinacionesQueSuman([2, 3, 6, 7], 7))).toEqual(normalizar([[2, 2, 3], [7]]));
});

test("varias combinaciones: [2, 3, 5] y 8", () => {
  expect(normalizar(combinacionesQueSuman([2, 3, 5], 8))).toEqual(
    normalizar([[2, 2, 2, 2], [2, 3, 3], [3, 5]]),
  );
});

test("no hay combinación: [2] y 1 da []", () => {
  expect(combinacionesQueSuman([2], 1)).toEqual([]);
  expect(combinacionesQueSuman([8, 10], 7)).toEqual([]);
});

test("repetir el mismo candidato: [1] y 2 da [[1, 1]]", () => {
  expect(combinacionesQueSuman([1], 2)).toEqual([[1, 1]]);
});

test("sin repetidos en otro orden: [2, 3] y 5 da solo [2, 3]", () => {
  expect(normalizar(combinacionesQueSuman([2, 3], 5))).toEqual(["2,3"]);
});

test("candidatos desordenados: [7, 3, 2] y 7, [5, 2] y 4", () => {
  expect(normalizar(combinacionesQueSuman([7, 3, 2], 7))).toEqual(normalizar([[2, 2, 3], [7]]));
  expect(combinacionesQueSuman([5, 2], 4)).toEqual([[2, 2]]);
});

test("no modifica el arreglo original", () => {
  const candidatos = [7, 3, 2];
  combinacionesQueSuman(candidatos, 7);
  expect(candidatos).toEqual([7, 3, 2]);
});
