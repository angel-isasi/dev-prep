import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { prediccion, arreglado } from "./solucion.js";

// El código del enunciado, tal cual.
function conVar(n) {
  const salida = [];
  for (var i = 0; i < n; i++) {
    setTimeout(() => salida.push(i), 0);
  }
  return salida;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("tu predicción coincide con lo que de verdad deja la versión con var", () => {
  const salida = conVar(3);
  vi.runAllTimers();
  expect(prediccion).toEqual(salida);
});

test("arreglado devuelve el arreglo vacío al instante (los setTimeout corren después)", () => {
  const resultado = arreglado(3);
  expect(Array.isArray(resultado), "arreglado debe devolver un arreglo").toBe(true);
  expect(resultado, "justo después de llamar, los setTimeout todavía no corrieron").toEqual([]);
});

test("arreglado(3) termina con [0, 1, 2]", () => {
  const resultado = arreglado(3);
  vi.runAllTimers();
  expect(resultado).toEqual([0, 1, 2]);
});

test("arreglado(5) termina con [0, 1, 2, 3, 4]", () => {
  const resultado = arreglado(5);
  vi.runAllTimers();
  expect(resultado).toEqual([0, 1, 2, 3, 4]);
});

test("arreglado(0) deja el arreglo vacío", () => {
  const resultado = arreglado(0);
  vi.runAllTimers();
  expect(resultado).toEqual([]);
});
