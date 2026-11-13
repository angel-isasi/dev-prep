import { test, expect } from "vitest";
import { rango } from "./solucion.js";

test("avanza de paso en paso e incluye el fin", () => {
  expect(rango(1, 10, 3)).toEqual([1, 4, 7, 10]);
});

test("sin paso, avanza de 1 en 1", () => {
  expect(rango(1, 3)).toEqual([1, 2, 3]);
});

test("se detiene antes de pasarse del fin", () => {
  expect(rango(0, 10, 4)).toEqual([0, 4, 8]);
});

test("si inicio y fin son iguales devuelve un solo número", () => {
  expect(rango(5, 5)).toEqual([5]);
});

test("si inicio es mayor que fin devuelve un arreglo vacío", () => {
  expect(rango(5, 1)).toEqual([]);
});
