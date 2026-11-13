import { test, expect } from "vitest";
import { invertirArbol } from "./solucion.js";

// Utilidad para armar árboles: n(valor, izquierdo, derecho).
const n = (val, left = null, right = null) => ({ val, left, right });

test("ejemplo clásico: el árbol completo queda en espejo", () => {
  const arbol = n(4, n(2, n(1), n(3)), n(7));
  expect(invertirArbol(arbol)).toEqual(n(4, n(7), n(2, n(3), n(1))));
});

test("también se invierten los nietos, no solo los hijos de la raíz", () => {
  const r = invertirArbol(n(4, n(2, n(1), n(3)), n(7)));
  expect(r.left.val).toBe(7);
  expect(r.right.left.val).toBe(3);
  expect(r.right.right.val).toBe(1);
});

test("árbol vacío: devuelve null", () => {
  expect(invertirArbol(null)).toBe(null);
});

test("un solo nodo: queda igual", () => {
  expect(invertirArbol(n(1))).toEqual(n(1));
});

test("devuelve la misma raíz (modifica el árbol, no crea otro)", () => {
  const arbol = n(1, n(2), n(3));
  const izquierdoOriginal = arbol.left;
  const r = invertirArbol(arbol);
  expect(r).toBe(arbol);
  expect(r.right).toBe(izquierdoOriginal);
});

test("en línea hacia la izquierda queda en línea hacia la derecha", () => {
  const arbol = n(1, n(2, n(3)));
  expect(invertirArbol(arbol)).toEqual(n(1, null, n(2, null, n(3))));
});
