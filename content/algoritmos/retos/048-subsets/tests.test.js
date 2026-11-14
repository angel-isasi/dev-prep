import { test, expect } from "vitest";
import { subconjuntos } from "./solucion.js";

// El orden no importa: ordeno cada subconjunto, lo convierto en texto
// ("1,2") y ordeno la lista de textos. Así dos respuestas iguales quedan idénticas.
const normalizar = (lista) => lista.map((s) => [...s].sort((a, b) => a - b).join(",")).sort();

test("ejemplo clásico: [1, 2, 3] tiene 8 subconjuntos", () => {
  expect(normalizar(subconjuntos([1, 2, 3]))).toEqual(
    normalizar([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]),
  );
});

test("un solo elemento: [0] da [[], [0]]", () => {
  expect(normalizar(subconjuntos([0]))).toEqual(normalizar([[], [0]]));
});

test("arreglo vacío: el único subconjunto es []", () => {
  expect(subconjuntos([])).toEqual([[]]);
});

test("con negativos: [5, -1]", () => {
  expect(normalizar(subconjuntos([5, -1]))).toEqual(normalizar([[], [5], [-1], [-1, 5]]));
});

test("[1, 2, 3, 4] da 2 elevado a 4 = 16 subconjuntos, sin repetidos", () => {
  const resultado = subconjuntos([1, 2, 3, 4]);
  expect(resultado).toHaveLength(16);
  expect(new Set(normalizar(resultado)).size).toBe(16);
});

test("no modifica el arreglo original", () => {
  const nums = [3, 1, 2];
  subconjuntos(nums);
  expect(nums).toEqual([3, 1, 2]);
});
