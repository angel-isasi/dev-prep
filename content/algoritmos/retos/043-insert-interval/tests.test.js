import { test, expect } from "vitest";
import { insertarIntervalo } from "./solucion.js";

test("ejemplo clásico: [[1, 3], [6, 9]] y [2, 5]", () => {
  expect(insertarIntervalo([[1, 3], [6, 9]], [2, 5])).toEqual([[1, 5], [6, 9]]);
});

test("se traga varios intervalos: [4, 8] en [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]]", () => {
  expect(insertarIntervalo([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])).toEqual([
    [1, 2],
    [3, 10],
    [12, 16],
  ]);
});

test("lista vacía: devuelve solo el nuevo", () => {
  expect(insertarIntervalo([], [5, 7])).toEqual([[5, 7]]);
});

test("va al inicio, en medio o al final sin tocar a nadie", () => {
  expect(insertarIntervalo([[3, 5]], [1, 2])).toEqual([[1, 2], [3, 5]]);
  expect(insertarIntervalo([[1, 2], [6, 7]], [3, 4])).toEqual([[1, 2], [3, 4], [6, 7]]);
  expect(insertarIntervalo([[1, 2]], [4, 6])).toEqual([[1, 2], [4, 6]]);
});

test("tocarse en un punto cuenta como superponerse", () => {
  expect(insertarIntervalo([[1, 5]], [5, 7])).toEqual([[1, 7]]);
  expect(insertarIntervalo([[1, 2], [5, 6]], [2, 5])).toEqual([[1, 6]]);
});

test("el nuevo cubre a todos o queda dentro de uno", () => {
  expect(insertarIntervalo([[2, 3], [4, 5]], [1, 10])).toEqual([[1, 10]]);
  expect(insertarIntervalo([[1, 10]], [3, 4])).toEqual([[1, 10]]);
});

test("no modifica la lista original, sus intervalos ni el nuevo", () => {
  const intervalos = [[1, 3], [6, 9]];
  const nuevo = [2, 5];
  insertarIntervalo(intervalos, nuevo);
  expect(intervalos).toEqual([[1, 3], [6, 9]]);
  expect(nuevo).toEqual([2, 5]);
});
