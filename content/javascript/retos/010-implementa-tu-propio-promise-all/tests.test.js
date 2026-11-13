import { test, expect, vi, afterEach } from "vitest";
import { promiseAll } from "./solucion.js";

const demora = (valor, ms) => new Promise((r) => setTimeout(() => r(valor), ms));

// Promesa que se rechaza. El .catch vacío evita avisos de "rechazo sin manejar"
// si tu función todavía no la usa; quien la reciba igual verá el rechazo.
const fallaEn = (mensaje, ms) => {
  const p = new Promise((_, rechazar) => setTimeout(() => rechazar(new Error(mensaje)), ms));
  p.catch(() => {});
  return p;
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("junta promesas y valores normales", async () => {
  const lenta = demora("lenta", 20);
  await expect(promiseAll([lenta, 2, Promise.resolve(3)])).resolves.toEqual(["lenta", 2, 3]);
});

test("con un arreglo vacío se cumple con []", async () => {
  const resultado = promiseAll([]);
  expect(resultado).toBeInstanceOf(Promise);
  await expect(resultado).resolves.toEqual([]);
});

test("se rechaza con el error de la promesa que falla", async () => {
  await expect(promiseAll([1, fallaEn("falló", 0)])).rejects.toThrow("falló");
});

test("respeta el orden original aunque terminen en otro orden", async () => {
  vi.useFakeTimers();
  const promesa = promiseAll([demora("a", 30), demora("b", 10), demora("c", 20)]);
  await vi.advanceTimersByTimeAsync(30);
  await expect(promesa).resolves.toEqual(["a", "b", "c"]);
});

test("se rechaza apenas una falla, sin esperar a las lentas", async () => {
  vi.useFakeTimers();
  let error = null;
  promiseAll([demora("lenta", 1000), fallaEn("caído", 10)]).catch((e) => {
    error = e;
  });
  await vi.advanceTimersByTimeAsync(10);
  expect(error, "a los 10 ms ya debería haberse rechazado").toBeInstanceOf(Error);
  expect(error.message).toBe("caído");
});

test("no usa Promise.all", async () => {
  const espia = vi.spyOn(Promise, "all");
  await promiseAll([1, Promise.resolve(2)]);
  expect(espia, "el reto es implementarlo a mano").not.toHaveBeenCalled();
});
