import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./solucion.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("escribir rápido manda una sola petición, no una por letra", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("c");
  buscarConEspera("ca");
  buscarConEspera("cas");
  buscarConEspera("casa");
  vi.advanceTimersByTime(300);
  expect(buscar).toHaveBeenCalledTimes(1);
});

test("busca con el último texto escrito", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("c");
  buscarConEspera("casa");
  vi.advanceTimersByTime(300);
  expect(buscar).toHaveBeenCalledWith("casa");
});

test("cada llamada nueva reinicia la espera", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("c");
  vi.advanceTimersByTime(200);
  buscarConEspera("ca");
  vi.advanceTimersByTime(200);
  expect(buscar).not.toHaveBeenCalled();
  vi.advanceTimersByTime(100);
  expect(buscar).toHaveBeenCalledTimes(1);
});

test("si hay una pausa larga entre llamadas, corren las dos", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("casa");
  vi.advanceTimersByTime(300);
  buscarConEspera("perro");
  vi.advanceTimersByTime(300);
  expect(buscar).toHaveBeenCalledTimes(2);
});
