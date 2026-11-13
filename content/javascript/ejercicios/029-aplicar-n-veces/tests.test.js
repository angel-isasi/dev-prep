import { test, expect, vi } from "vitest";
import { aplicarVeces } from "./solucion.js";

test("duplica 3 veces partiendo de 1", () => {
  expect(aplicarVeces((n) => n * 2, 3, 1)).toBe(8);
});

test("con 0 veces devuelve el valor sin cambios", () => {
  expect(aplicarVeces((s) => s + "!", 0, "hola")).toBe("hola");
});

test("funciona con textos", () => {
  expect(aplicarVeces((s) => s + "!", 2, "hola")).toBe("hola!!");
});

test("con 1 vez aplica la función una sola vez", () => {
  expect(aplicarVeces((n) => n + 10, 1, 5)).toBe(15);
});

test("llama a fn exactamente las veces pedidas, encadenando resultados", () => {
  const fn = vi.fn((n) => n + 1);
  expect(aplicarVeces(fn, 4, 0)).toBe(4);
  expect(fn).toHaveBeenCalledTimes(4);
  expect(fn).toHaveBeenLastCalledWith(3);
});
