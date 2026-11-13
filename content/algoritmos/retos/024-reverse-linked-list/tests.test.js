import { test, expect } from "vitest";
import { invertir } from "./solucion.js";

// Utilidades: arreglo -> lista enlazada y lista enlazada -> arreglo.
const lista = (valores) => valores.reduceRight((next, val) => ({ val, next }), null);
const aArreglo = (nodo) => {
  const valores = [];
  while (nodo) {
    valores.push(nodo.val);
    nodo = nodo.next;
  }
  return valores;
};

test("invierte 1 -> 2 -> 3 -> 4 -> 5", () => {
  expect(aArreglo(invertir(lista([1, 2, 3, 4, 5])))).toEqual([5, 4, 3, 2, 1]);
});

test("lista vacía: devuelve null", () => {
  expect(invertir(null)).toBe(null);
});

test("un solo nodo: devuelve ese mismo nodo", () => {
  const cabeza = lista([7]);
  const nueva = invertir(cabeza);
  expect(nueva).toBe(cabeza);
  expect(aArreglo(nueva)).toEqual([7]);
});

test("dos nodos: 1 -> 2 queda 2 -> 1", () => {
  expect(aArreglo(invertir(lista([1, 2])))).toEqual([2, 1]);
});

test("reutiliza los nodos: la cabeza vieja queda al final apuntando a null", () => {
  const cabeza = lista([1, 2, 3]);
  const ultimo = cabeza.next.next;
  const nueva = invertir(cabeza);
  expect(nueva).toBe(ultimo);
  expect(nueva.next.next).toBe(cabeza);
  expect(cabeza.next).toBe(null);
});
