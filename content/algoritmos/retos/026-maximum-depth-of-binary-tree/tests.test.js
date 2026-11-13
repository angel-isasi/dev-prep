import { test, expect } from "vitest";
import { profundidad } from "./solucion.js";

// Utilidad para armar árboles: n(valor, izquierdo, derecho).
const n = (val, left = null, right = null) => ({ val, left, right });

test("ejemplo clásico: la rama más larga está a la derecha (3)", () => {
  const arbol = n(3, n(9), n(20, n(15), n(7)));
  expect(profundidad(arbol)).toBe(3);
});

test("árbol vacío: 0", () => {
  expect(profundidad(null)).toBe(0);
});

test("un solo nodo: 1", () => {
  expect(profundidad(n(1))).toBe(1);
});

test("en línea hacia la izquierda: 4 niveles", () => {
  const arbol = n(1, n(2, n(3, n(4))));
  expect(profundidad(arbol)).toBe(4);
});

test("desbalanceado: una rama corta y otra larga", () => {
  const arbol = n(1, n(2), n(3, null, n(4, n(5))));
  expect(profundidad(arbol)).toBe(4);
});

test("los hijos ausentes pueden no existir (sin left/right)", () => {
  const arbol = { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } };
  expect(profundidad(arbol)).toBe(3);
});
