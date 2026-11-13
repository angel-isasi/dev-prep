import { test, expect, vi, afterEach } from "vitest";
import { sondear } from "./solucion.js";

afterEach(() => {
  vi.useRealTimers();
});

test("devuelve el valor en cuanto consultar responde algo verdadero", async () => {
  let llamadas = 0;
  const consultar = async () => (++llamadas === 3 ? "publicado" : null);

  expect(await sondear(consultar, 5, 5)).toBe("publicado");
  expect(llamadas, "no debería seguir consultando después del éxito").toBe(3);
});

test("si se acaban los intentos, rechaza y consultó exactamente esa cantidad de veces", async () => {
  const consultar = vi.fn(async () => null);
  await expect(sondear(consultar, 2, 3)).rejects.toThrow("Se agotaron los intentos");
  expect(consultar).toHaveBeenCalledTimes(3);
});

test("la primera consulta es inmediata y luego espera el intervalo entre consultas", async () => {
  vi.useFakeTimers();
  const consultar = vi.fn(async () => null);
  const promesa = sondear(consultar, 100, 3);
  promesa.catch(() => {});

  await vi.advanceTimersByTimeAsync(0);
  expect(consultar).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(99);
  expect(consultar, "a los 99 ms todavía no toca la segunda consulta").toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1);
  expect(consultar).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(100);
  expect(consultar).toHaveBeenCalledTimes(3);
  await expect(promesa).rejects.toThrow("Se agotaron los intentos");
});

test("no espera después de la última consulta", async () => {
  vi.useFakeTimers();
  let rechazada = false;
  const promesa = sondear(async () => null, 100, 2);
  promesa.catch(() => {
    rechazada = true;
  });

  await vi.advanceTimersByTimeAsync(100);
  expect(rechazada, "a los 100 ms ya hizo sus 2 consultas: debería haber rechazado").toBe(true);
});

test("si la primera consulta ya responde, no espera nada", async () => {
  vi.useFakeTimers();
  let valor;
  sondear(async () => "listo", 1000, 3).then((v) => {
    valor = v;
  });

  await vi.advanceTimersByTimeAsync(0);
  expect(valor).toBe("listo");
});
