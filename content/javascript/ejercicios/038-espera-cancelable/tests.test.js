import { test, expect, vi, afterEach } from "vitest";
import { esperarCancelable } from "./solucion.js";

afterEach(() => {
  vi.useRealTimers();
});

test("sin cancelar, se cumple después del tiempo pedido", async () => {
  vi.useFakeTimers();
  const control = new AbortController();
  let cumplida = false;
  esperarCancelable(100, control.signal).then(() => {
    cumplida = true;
  });

  await vi.advanceTimersByTimeAsync(99);
  expect(cumplida).toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  expect(cumplida).toBe(true);
});

test("al cancelar, se rechaza con 'Cancelado' sin esperar el tiempo completo", async () => {
  const control = new AbortController();
  const inicio = Date.now();
  const promesa = esperarCancelable(1000, control.signal);
  expect(promesa).toBeInstanceOf(Promise);

  control.abort();
  await expect(promesa).rejects.toThrow("Cancelado");
  expect(Date.now() - inicio).toBeLessThan(500);
});

test("el rechazo es un Error de verdad", async () => {
  const control = new AbortController();
  const promesa = esperarCancelable(1000, control.signal);
  control.abort();
  await expect(promesa).rejects.toBeInstanceOf(Error);
});

test("si la señal ya estaba cancelada, se rechaza de inmediato", async () => {
  const control = new AbortController();
  control.abort();
  const inicio = Date.now();
  await expect(esperarCancelable(1000, control.signal)).rejects.toThrow("Cancelado");
  expect(Date.now() - inicio).toBeLessThan(500);
});

test("al cancelar, limpia el temporizador", async () => {
  vi.useFakeTimers();
  const control = new AbortController();
  const promesa = esperarCancelable(1000, control.signal);
  promesa.catch(() => {});
  expect(vi.getTimerCount(), "debería haber un temporizador corriendo").toBe(1);

  control.abort();
  expect(vi.getTimerCount(), "el temporizador debería haberse limpiado con clearTimeout").toBe(0);
  await expect(promesa).rejects.toThrow("Cancelado");
});

test("cancelar después de que terminó la espera no causa errores", async () => {
  const control = new AbortController();
  await esperarCancelable(10, control.signal);
  expect(() => control.abort()).not.toThrow();
});
