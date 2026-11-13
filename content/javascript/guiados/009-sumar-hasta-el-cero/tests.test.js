import { test, expect } from "vitest";
import { sumarHastaCero } from "./solucion.js";

test("suma todos si son positivos", () => {
  expect(sumarHastaCero([1, 2, 3])).toBe(6);
});

test("salta los negativos y sigue sumando", () => {
  expect(sumarHastaCero([5, -2, 3])).toBe(8);
  expect(sumarHastaCero([-1, -2])).toBe(0);
});

test("se detiene al encontrar un 0", () => {
  expect(sumarHastaCero([4, 0, 10])).toBe(4);
  expect(sumarHastaCero([-1, 2, 0, 5])).toBe(2);
});

test("si el primero es 0 devuelve 0", () => {
  expect(sumarHastaCero([0, 5, 6])).toBe(0);
});

test("array vacío devuelve 0", () => {
  expect(sumarHastaCero([])).toBe(0);
});
