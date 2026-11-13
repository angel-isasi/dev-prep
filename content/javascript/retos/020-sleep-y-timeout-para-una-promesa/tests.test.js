import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { sleep, conTimeout } from "./solucion.js";

// Promesa que se rechaza. El .catch vacío evita avisos de "rechazo sin manejar"
// si tu función todavía no la usa; quien la reciba igual verá el rechazo.
const fallaEn = (mensaje, ms) => {
  const p = new Promise((_, rechazar) => setTimeout(() => rechazar(new Error(mensaje)), ms));
  p.catch(() => {});
  return p;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("sleep se cumple a los ms indicados, no antes", async () => {
  let listo = false;
  const promesa = sleep(100);
  expect(promesa).toBeInstanceOf(Promise);
  promesa.then(() => {
    listo = true;
  });
  await vi.advanceTimersByTimeAsync(99);
  expect(listo, "a los 99 ms todavía no").toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  expect(listo).toBe(true);
});

test("conTimeout devuelve el valor si la promesa llega a tiempo", async () => {
  let valor;
  conTimeout(sleep(5).then(() => "a tiempo"), 50).then((v) => {
    valor = v;
  });
  await vi.advanceTimersByTimeAsync(5);
  expect(valor).toBe("a tiempo");
});

test("conTimeout se rechaza con 'Tiempo agotado' si la promesa tarda más", async () => {
  let error = null;
  conTimeout(sleep(500), 100).catch((e) => {
    error = e;
  });
  await vi.advanceTimersByTimeAsync(99);
  expect(error, "a los 99 ms todavía hay tiempo").toBe(null);
  await vi.advanceTimersByTimeAsync(1);
  expect(error).toBeInstanceOf(Error);
  expect(error.message).toBe("Tiempo agotado");
});

test("si la promesa original falla a tiempo, se rechaza con ese mismo error", async () => {
  const promesa = conTimeout(fallaEn("caído", 10), 100);
  promesa?.catch?.(() => {});
  await vi.advanceTimersByTimeAsync(10);
  await expect(promesa).rejects.toThrow("caído");
});

test("al terminar, limpia su temporizador", async () => {
  const promesa = conTimeout(Promise.resolve("listo"), 1000);
  await expect(promesa).resolves.toBe("listo");
  expect(vi.getTimerCount(), "el temporizador del límite debería haberse limpiado").toBe(0);
});
