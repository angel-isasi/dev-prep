import { test, expect, vi } from "vitest";
import { despuesDe } from "./solucion.js";

test("devuelve undefined hasta la llamada número N", () => {
  const listo = despuesDe(3, () => "listo");
  expect([listo(), listo(), listo()]).toEqual([undefined, undefined, "listo"]);
});

test("después de la llamada N sigue ejecutando", () => {
  const listo = despuesDe(2, () => "listo");
  listo();
  expect(listo()).toBe("listo");
  expect(listo()).toBe("listo");
});

test("no llama a fn antes de tiempo", () => {
  const fn = vi.fn(() => "ok");
  const envuelta = despuesDe(3, fn);
  envuelta();
  envuelta();
  expect(fn).not.toHaveBeenCalled();
  envuelta();
  expect(fn).toHaveBeenCalledTimes(1);
});

test("le pasa los argumentos a fn", () => {
  const sumar = despuesDe(2, (a, b) => a + b);
  expect(sumar(1, 1)).toBeUndefined();
  expect(sumar(2, 3)).toBe(5);
});

test("con veces = 1 ejecuta desde la primera llamada", () => {
  const saludar = despuesDe(1, () => "hola");
  expect(saludar()).toBe("hola");
});

test("cada función lleva su propia cuenta", () => {
  const a = despuesDe(2, () => "a");
  const b = despuesDe(2, () => "b");
  a();
  expect(b()).toBeUndefined();
  expect(a()).toBe("a");
});
