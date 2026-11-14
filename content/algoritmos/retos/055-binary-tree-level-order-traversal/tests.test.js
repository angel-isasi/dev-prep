import { test, expect } from "vitest";
import { recorridoPorNiveles } from "./solucion.js";

// Utilidad para armar árboles: n(valor, izquierdo, derecho).
const n = (val, left = null, right = null) => ({ val, left, right });

test("ejemplo clásico: [[3], [9, 20], [15, 7]]", () => {
  const arbol = n(3, n(9), n(20, n(15), n(7)));
  expect(recorridoPorNiveles(arbol)).toEqual([[3], [9, 20], [15, 7]]);
});

test("árbol vacío: []", () => {
  expect(recorridoPorNiveles(null)).toEqual([]);
});

test("un solo nodo: [[1]]", () => {
  expect(recorridoPorNiveles(n(1))).toEqual([[1]]);
});

test("árbol completo de 3 niveles", () => {
  const arbol = n(1, n(2, n(4), n(5)), n(3, n(6), n(7)));
  expect(recorridoPorNiveles(arbol)).toEqual([[1], [2, 3], [4, 5, 6, 7]]);
});

test("en línea: cada nivel tiene un solo valor", () => {
  const arbol = n(1, n(2, null, n(3, n(4))));
  expect(recorridoPorNiveles(arbol)).toEqual([[1], [2], [3], [4]]);
});

test("primos en el mismo nivel van juntos, de izquierda a derecha", () => {
  const arbol = n(1, n(2, null, n(4)), n(3, n(5)));
  expect(recorridoPorNiveles(arbol)).toEqual([[1], [2, 3], [4, 5]]);
});

test("los hijos ausentes pueden no existir (sin left/right)", () => {
  const arbol = { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } };
  expect(recorridoPorNiveles(arbol)).toEqual([[3], [9, 20], [15, 7]]);
});
