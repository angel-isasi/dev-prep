import { test, expect } from "vitest";
import { contarLlamadas } from "./solucion.js";

test("cuenta cuántas veces se llamó", () => {
  const sumar = contarLlamadas((a, b) => a + b);
  sumar(1, 2);
  sumar(2, 3);
  expect(sumar.veces).toBe(2);
});

test("la cuenta empieza en 0", () => {
  const sumar = contarLlamadas((a, b) => a + b);
  expect(sumar.veces).toBe(0);
});

test("pasa los argumentos y devuelve el mismo resultado que la original", () => {
  const sumar = contarLlamadas((a, b) => a + b);
  sumar(1, 2);
  expect(sumar(2, 3)).toBe(5);
});

test("cada función envuelta lleva su propia cuenta", () => {
  const doble = contarLlamadas((n) => n * 2);
  const triple = contarLlamadas((n) => n * 3);
  doble(1);
  doble(2);
  triple(1);
  expect(doble.veces).toBe(2);
  expect(triple.veces).toBe(1);
});
