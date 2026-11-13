import { test, expect } from "vitest";
import { unir } from "./solucion.js";

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

test("ejemplo clásico: 1 -> 2 -> 4 y 1 -> 3 -> 4", () => {
  expect(aArreglo(unir(lista([1, 2, 4]), lista([1, 3, 4])))).toEqual([1, 1, 2, 3, 4, 4]);
});

test("una lista vacía: devuelve la otra", () => {
  expect(aArreglo(unir(null, lista([0])))).toEqual([0]);
  expect(aArreglo(unir(lista([5, 6]), null))).toEqual([5, 6]);
});

test("las dos vacías: devuelve null", () => {
  expect(unir(null, null)).toBe(null);
});

test("largos distintos: 1 -> 5 -> 9 -> 10 y 2", () => {
  expect(aArreglo(unir(lista([1, 5, 9, 10]), lista([2])))).toEqual([1, 2, 5, 9, 10]);
});

test("todos los de una son menores: 1 -> 2 y 3 -> 4", () => {
  expect(aArreglo(unir(lista([1, 2]), lista([3, 4])))).toEqual([1, 2, 3, 4]);
});

test("negativos y repetidos, reutilizando los nodos", () => {
  const a = lista([-3, 0, 0]);
  const b = lista([-3, 1]);
  const cabeza = unir(a, b);
  expect(aArreglo(cabeza)).toEqual([-3, -3, 0, 0, 1]);
  expect(cabeza).toBe(a); // con empate se engancha primero el de `a`
});
