import { test, expect, vi, afterEach } from "vitest";
import { reintentar } from "./solucion.js";

afterEach(() => {
  vi.useRealTimers();
});

test("reintenta hasta que sale bien", async () => {
  let llamadas = 0;
  const inestable = async () => {
    if (++llamadas < 3) throw new Error("caído");
    return "ok";
  };
  expect(await reintentar(inestable, 3, 1)).toBe("ok");
  expect(llamadas).toBe(3);
});

test("si se acaban los intentos, se rechaza con el último error", async () => {
  let n = 0;
  const fn = vi.fn(async () => {
    throw new Error(`fallo ${++n}`);
  });
  await expect(reintentar(fn, 2, 1)).rejects.toThrow("fallo 2");
  expect(fn).toHaveBeenCalledTimes(2);
});

test("si sale bien al primer intento, no espera ni reintenta", async () => {
  vi.useFakeTimers();
  const fn = vi.fn(async () => "listo");
  let valor;
  reintentar(fn, 3, 1000).then((v) => {
    valor = v;
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(valor).toBe("listo");
  expect(fn).toHaveBeenCalledTimes(1);
});

test("las esperas se duplican: 100 ms y luego 200 ms", async () => {
  vi.useFakeTimers();
  const fn = vi.fn(async () => {
    throw new Error("caído");
  });
  const promesa = reintentar(fn, 3, 100);
  promesa.catch(() => {});

  await vi.advanceTimersByTimeAsync(0);
  expect(fn, "el primer intento es inmediato").toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(99);
  expect(fn, "a los 99 ms todavía no toca el segundo intento").toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(fn).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(199);
  expect(fn, "la segunda espera es de 200 ms, no de 100").toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(1);
  expect(fn).toHaveBeenCalledTimes(3);
  await expect(promesa).rejects.toThrow("caído");
});

test("no espera después del último intento", async () => {
  vi.useFakeTimers();
  let rechazada = false;
  reintentar(async () => {
    throw new Error("caído");
  }, 2, 100).catch(() => {
    rechazada = true;
  });

  await vi.advanceTimersByTimeAsync(100);
  expect(rechazada, "a los 100 ms ya hizo sus 2 intentos: debería haberse rechazado").toBe(true);
});
