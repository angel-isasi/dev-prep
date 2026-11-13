import { test, expect, vi, afterEach } from "vitest";
import { aplanar } from "./solucion.js";

afterEach(() => {
  vi.restoreAllMocks();
});

test("aplana varios niveles de anidación", () => {
  expect(aplanar([1, [2, [3, [4]]], 5])).toEqual([1, 2, 3, 4, 5]);
});

test("un arreglo vacío devuelve un arreglo vacío", () => {
  expect(aplanar([])).toEqual([]);
});

test("los arreglos vacíos internos desaparecen", () => {
  expect(aplanar([[], [[]], 1, [[], [2]]])).toEqual([1, 2]);
});

test("los textos y objetos se agregan tal cual", () => {
  const obj = { id: 1 };
  expect(aplanar(["ab", ["cd", [obj]]])).toEqual(["ab", "cd", obj]);
});

test("no modifica el arreglo original", () => {
  const original = [1, [2, [3]]];
  aplanar(original);
  expect(original).toEqual([1, [2, [3]]]);
});

test("no usa .flat() ni .flatMap()", () => {
  const flat = vi.spyOn(Array.prototype, "flat");
  const flatMap = vi.spyOn(Array.prototype, "flatMap");
  expect(aplanar([1, [2, [3]]])).toEqual([1, 2, 3]);
  expect(flat, "el reto es aplanar a mano").not.toHaveBeenCalled();
  expect(flatMap, "el reto es aplanar a mano").not.toHaveBeenCalled();
});
