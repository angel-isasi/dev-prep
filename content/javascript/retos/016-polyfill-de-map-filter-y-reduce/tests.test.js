import { test, expect } from "vitest";
import "./solucion.js";

test("miMap transforma cada elemento y recibe índice y arreglo", () => {
  expect([1, 2, 3].miMap((x) => x * 2)).toEqual([2, 4, 6]);
  expect([10, 20].miMap((x, i, arr) => `${i}:${x}/${arr.length}`)).toEqual(["0:10/2", "1:20/2"]);
});

test("miFilter se queda con los que cumplen la condición", () => {
  expect([1, 2, 3, 4].miFilter((x) => x % 2 === 0)).toEqual([2, 4]);
  expect(["a", "b", "c"].miFilter((_, i) => i !== 1)).toEqual(["a", "c"]);
});

test("miReduce sin valor inicial empieza con el primer elemento", () => {
  expect([1, 2, 3].miReduce((a, b) => a + b)).toBe(6);
  const vueltas = [];
  ["x", "y", "z"].miReduce((acc, el, i) => {
    vueltas.push(i);
    return acc + el;
  });
  expect(vueltas, "sin inicial, la primera vuelta es con el índice 1").toEqual([1, 2]);
});

test("miReduce con valor inicial empieza desde el índice 0", () => {
  expect([1, 2, 3].miReduce((a, b) => a + b, 10)).toBe(16);
  expect([1, 2, 3].miReduce((obj, x) => ({ ...obj, [x]: x * x }), {})).toEqual({ 1: 1, 2: 4, 3: 9 });
});

test("miReduce con arreglo vacío: devuelve el inicial o lanza TypeError si no hay", () => {
  expect([].miReduce((a, b) => a + b, 0)).toBe(0);
  expect(() => [].miReduce((a, b) => a + b)).toThrow(TypeError);
});

test("ninguno modifica el arreglo original y map y filter devuelven arreglos nuevos", () => {
  const original = [1, 2, 3];
  const mapeado = original.miMap((x) => x);
  const filtrado = original.miFilter(() => true);
  original.miReduce((a, b) => a + b);
  expect(original).toEqual([1, 2, 3]);
  expect(mapeado).not.toBe(original);
  expect(filtrado).not.toBe(original);
});
