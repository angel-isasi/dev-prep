import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "./solucion.js";

// Los temporizadores falsos también controlan Date.now().
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("la primera llamada se ejecuta al instante", () => {
  const fn = vi.fn();
  const t = throttle(fn, 50);
  t("hola");
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("hola");
});

test("ignora las llamadas que llegan dentro del intervalo", () => {
  const fn = vi.fn();
  const t = throttle(fn, 50);
  t(1);
  t(2);
  t(3);
  expect(fn.mock.calls).toEqual([[1]]);
});

test("vuelve a ejecutar cuando ya pasó el intervalo", () => {
  const fn = vi.fn();
  const t = throttle(fn, 50);
  t(1);
  t(2);
  t(3);
  vi.advanceTimersByTime(60);
  t(4);
  expect(fn.mock.calls).toEqual([[1], [4]]);
});

test("a 1 ms del intervalo todavía ignora, y justo al cumplirse ejecuta", () => {
  const fn = vi.fn();
  const t = throttle(fn, 50);
  t("a");
  vi.advanceTimersByTime(49);
  t("b");
  expect(fn.mock.calls, "a los 49 ms la llamada debe ignorarse").toEqual([["a"]]);
  vi.advanceTimersByTime(1);
  t("c");
  expect(fn.mock.calls).toEqual([["a"], ["c"]]);
});

test("pasa todos los argumentos y respeta el this", () => {
  const registro = [];
  const pagina = {
    nombre: "inicio",
    alHacerScroll: throttle(function (x, y) {
      registro.push(`${this.nombre} ${x},${y}`);
    }, 100),
  };
  pagina.alHacerScroll(0, 250);
  expect(registro).toEqual(["inicio 0,250"]);
});
