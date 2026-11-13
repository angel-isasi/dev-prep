import { test, expect, vi } from "vitest";
import { once } from "./solucion.js";

test("solo se ejecuta la primera vez", () => {
  let n = 0;
  const iniciar = once(() => ++n);
  iniciar();
  iniciar();
  iniciar();
  expect(n).toBe(1);
});

test("las siguientes llamadas devuelven el primer resultado", () => {
  let n = 0;
  const iniciar = once(() => ++n);
  expect(iniciar()).toBe(1);
  expect(iniciar()).toBe(1);
});

test("usa los argumentos de la primera llamada e ignora los demás", () => {
  const saludar = once((nombre) => `Hola, ${nombre}`);
  expect(saludar("Ana")).toBe("Hola, Ana");
  expect(saludar("Luis")).toBe("Hola, Ana");
});

test("aunque fn devuelva undefined, se ejecuta una sola vez", () => {
  const fn = vi.fn(() => undefined);
  const registrar = once(fn);
  registrar();
  registrar();
  expect(fn).toHaveBeenCalledTimes(1);
});

test("cada once es independiente", () => {
  const a = once(() => "a");
  const b = once(() => "b");
  expect(a()).toBe("a");
  expect(b()).toBe("b");
});
