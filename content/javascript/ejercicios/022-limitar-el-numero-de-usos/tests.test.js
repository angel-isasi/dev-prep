import { test, expect, vi } from "vitest";
import { limitar } from "./solucion.js";

test("con max = 1 solo ejecuta la primera vez", () => {
  let cuenta = 0;
  const votar = limitar(() => ++cuenta, 1);
  votar();
  votar();
  votar();
  expect(cuenta).toBe(1);
});

test("después del límite devuelve el último resultado", () => {
  let cuenta = 0;
  const votar = limitar(() => ++cuenta, 1);
  expect(votar()).toBe(1);
  expect(votar()).toBe(1);
});

test("con max = 2 ejecuta exactamente 2 veces", () => {
  const fn = vi.fn(() => "ok");
  const limitada = limitar(fn, 2);
  limitada();
  limitada();
  limitada();
  limitada();
  expect(fn).toHaveBeenCalledTimes(2);
});

test("le pasa los argumentos a fn y guarda el último resultado", () => {
  const saludar = limitar((nombre) => `Hola, ${nombre}`, 2);
  expect(saludar("Ana")).toBe("Hola, Ana");
  expect(saludar("Luis")).toBe("Hola, Luis");
  expect(saludar("Rosa")).toBe("Hola, Luis");
});

test("cada función limitada lleva su propia cuenta", () => {
  const a = limitar(() => "a", 1);
  const b = limitar(() => "b", 1);
  a();
  a();
  expect(b()).toBe("b");
});
