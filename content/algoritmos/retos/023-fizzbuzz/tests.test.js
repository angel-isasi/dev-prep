import { test, expect } from "vitest";
import { fizzBuzz } from "./solucion.js";

test("del 1 al 5", () => {
  expect(fizzBuzz(5)).toEqual(["1", "2", "Fizz", "4", "Buzz"]);
});

test("del 1 al 15 completo, terminando en FizzBuzz", () => {
  expect(fizzBuzz(15)).toEqual([
    "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
    "11", "Fizz", "13", "14", "FizzBuzz",
  ]);
});

test("los números van como texto: fizzBuzz(2) da [\"1\", \"2\"]", () => {
  expect(fizzBuzz(2)).toEqual(["1", "2"]);
});

test("múltiplos sueltos: 9 es Fizz, 10 es Buzz y 30 es FizzBuzz", () => {
  const r = fizzBuzz(30);
  expect(r[8]).toBe("Fizz");
  expect(r[9]).toBe("Buzz");
  expect(r[29]).toBe("FizzBuzz");
});

test("n = 0 devuelve un arreglo vacío", () => {
  expect(fizzBuzz(0)).toEqual([]);
});
