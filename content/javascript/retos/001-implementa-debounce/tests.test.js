import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./solucion.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("de una ráfaga de llamadas, solo se ejecuta la última", () => {
  const fn = vi.fn();
  const d = debounce(fn, 30);
  d(1);
  d(2);
  d(3);
  vi.advanceTimersByTime(30);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(3);
});

test("no se ejecuta antes de que pase el tiempo", () => {
  const fn = vi.fn();
  const d = debounce(fn, 30);
  d("hola");
  vi.advanceTimersByTime(29);
  expect(fn, "a los 29 ms todavía no debería ejecutarse").not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("cada llamada reinicia la espera", () => {
  const fn = vi.fn();
  const d = debounce(fn, 30);
  d("a");
  vi.advanceTimersByTime(20);
  d("b");
  vi.advanceTimersByTime(20);
  expect(fn, "la segunda llamada debió reiniciar la cuenta").not.toHaveBeenCalled();
  vi.advanceTimersByTime(10);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("b");
});

test("dos ráfagas separadas producen dos ejecuciones", () => {
  const fn = vi.fn();
  const d = debounce(fn, 30);
  d("primera");
  vi.advanceTimersByTime(30);
  d("segunda");
  vi.advanceTimersByTime(30);
  expect(fn.mock.calls).toEqual([["primera"], ["segunda"]]);
});

test("pasa todos los argumentos y respeta el this", () => {
  const registro = [];
  const buscador = {
    nombre: "Ica",
    buscar: debounce(function (a, b) {
      registro.push(`${this.nombre} ${a} ${b}`);
    }, 10),
  };
  buscador.buscar("x", "y");
  vi.advanceTimersByTime(10);
  expect(registro).toEqual(["Ica x y"]);
});
