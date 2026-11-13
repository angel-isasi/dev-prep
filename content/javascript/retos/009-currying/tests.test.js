import { test, expect, vi } from "vitest";
import { curry } from "./solucion.js";

const sumar3 = curry((a, b, c) => a + b + c);

test("acepta los argumentos de a uno", () => {
  expect(sumar3(1)(2)(3)).toBe(6);
});

test("acepta los argumentos agrupados de cualquier forma", () => {
  expect(sumar3(1, 2)(3)).toBe(6);
  expect(sumar3(1)(2, 3)).toBe(6);
});

test("con todos los argumentos juntos, ejecuta de inmediato", () => {
  expect(sumar3(1, 2, 3)).toBe(6);
});

test("las funciones parciales se pueden reutilizar sin mezclarse", () => {
  const sumar10 = sumar3(4, 6);
  expect(sumar10(1)).toBe(11);
  expect(sumar10(5)).toBe(15);
  const empiezaEn1 = sumar3(1);
  expect(empiezaEn1(1)(1)).toBe(3);
  expect(empiezaEn1(10)(10)).toBe(21);
});

test("no ejecuta fn hasta tener todos los argumentos, y respeta su orden", () => {
  const fn = vi.fn((a, b, c) => `${a}-${b}-${c}`);
  const unir = curry(fn);
  const parcial = unir("x")("y");
  expect(fn, "con 2 de 3 argumentos todavía no debe ejecutarse").not.toHaveBeenCalled();
  expect(parcial("z")).toBe("x-y-z");
  expect(fn).toHaveBeenCalledTimes(1);
});
