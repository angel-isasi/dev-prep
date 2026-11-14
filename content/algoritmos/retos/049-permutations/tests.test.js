import { test, expect } from "vitest";
import { permutaciones } from "./solucion.js";

// El orden de la lista no importa, pero el de cada permutación sí:
// convierto cada una en texto ("1,2,3") sin reordenarla y ordeno la lista.
const normalizar = (lista) => lista.map((p) => p.join(",")).sort();

test("ejemplo clásico: [1, 2, 3] tiene 6 permutaciones", () => {
  expect(normalizar(permutaciones([1, 2, 3]))).toEqual(
    normalizar([[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]),
  );
});

test("dos números: [0, 1] da [[0, 1], [1, 0]]", () => {
  expect(normalizar(permutaciones([0, 1]))).toEqual(normalizar([[0, 1], [1, 0]]));
});

test("un solo número: [1] da [[1]]", () => {
  expect(permutaciones([1])).toEqual([[1]]);
});

test("con negativos: [-1, 0, 2]", () => {
  expect(normalizar(permutaciones([-1, 0, 2]))).toEqual(
    normalizar([[-1, 0, 2], [-1, 2, 0], [0, -1, 2], [0, 2, -1], [2, -1, 0], [2, 0, -1]]),
  );
});

test("[1, 2, 3, 4] da 4! = 24 permutaciones distintas que usan cada número una vez", () => {
  const resultado = permutaciones([1, 2, 3, 4]);
  expect(resultado).toHaveLength(24);
  expect(new Set(normalizar(resultado)).size).toBe(24);
  for (const p of resultado) {
    expect([...p].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  }
});

test("no modifica el arreglo original", () => {
  const nums = [3, 1, 2];
  permutaciones(nums);
  expect(nums).toEqual([3, 1, 2]);
});
