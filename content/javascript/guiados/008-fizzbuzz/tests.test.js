import { test, expect } from "vitest";
import { fizzBuzz } from "./solucion.js";

test("del 1 al 5", () => {
  expect(fizzBuzz(5)).toEqual([1, 2, "Fizz", 4, "Buzz"]);
});

test("del 1 al 15, con el primer FizzBuzz al final", () => {
  expect(fizzBuzz(15)).toEqual([
    1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz",
  ]);
});

test("los números que no se reemplazan quedan como número, no como texto", () => {
  expect(fizzBuzz(1)).toEqual([1]);
});

test("el 30 también es FizzBuzz y el array tiene n elementos", () => {
  const resultado = fizzBuzz(30);
  expect(resultado).toHaveLength(30);
  expect(resultado[29]).toBe("FizzBuzz");
});

test("con 0 devuelve un array vacío", () => {
  expect(fizzBuzz(0)).toEqual([]);
});
