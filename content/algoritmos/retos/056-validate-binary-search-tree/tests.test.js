import { test, expect } from "vitest";
import { esArbolDeBusqueda } from "./solucion.js";

// Utilidad para armar árboles: n(valor, izquierdo, derecho).
const n = (val, left = null, right = null) => ({ val, left, right });

test("ejemplo simple válido: 1 < 2 < 3", () => {
  expect(esArbolDeBusqueda(n(2, n(1), n(3)))).toBe(true);
});

test("hijo derecho menor que la raíz: inválido", () => {
  const arbol = n(5, n(1), n(4, n(3), n(6)));
  expect(esArbolDeBusqueda(arbol)).toBe(false);
});

test("la trampa: cada padre con sus hijos se ve bien, pero el 3 está a la derecha del 5", () => {
  const arbol = n(5, n(4), n(6, n(3), n(7)));
  expect(esArbolDeBusqueda(arbol)).toBe(false);
});

test("la misma trampa por la izquierda: el 12 está a la izquierda del 10", () => {
  const arbol = n(10, n(5, null, n(12)), n(15));
  expect(esArbolDeBusqueda(arbol)).toBe(false);
});

test("árbol vacío y un solo nodo son válidos", () => {
  expect(esArbolDeBusqueda(null)).toBe(true);
  expect(esArbolDeBusqueda(n(7))).toBe(true);
});

test("valores repetidos no están permitidos", () => {
  expect(esArbolDeBusqueda(n(2, n(2), n(3)))).toBe(false);
  expect(esArbolDeBusqueda(n(2, n(1), n(2)))).toBe(false);
});

test("árbol válido de 3 niveles, con negativos", () => {
  const arbol = n(0, n(-4, n(-6), n(-2)), n(4, n(2), n(6)));
  expect(esArbolDeBusqueda(arbol)).toBe(true);
});

test("los hijos ausentes pueden no existir (sin left/right)", () => {
  const arbol = { val: 8, left: { val: 3, right: { val: 6 } }, right: { val: 10 } };
  expect(esArbolDeBusqueda(arbol)).toBe(true);
});
