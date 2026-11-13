import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { secuencial, paralelo } from "./solucion.js";

// Crea una tarea espiable que tarda `ms` y se cumple con `valor`.
const tarea = (valor, ms) => vi.fn(() => new Promise((r) => setTimeout(() => r(valor), ms)));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("secuencial: no arranca la siguiente hasta que termina la anterior", async () => {
  const a = tarea("a", 30);
  const b = tarea("b", 30);
  secuencial([a, b]);

  await vi.advanceTimersByTimeAsync(0);
  expect(a).toHaveBeenCalledTimes(1);
  expect(b, "b no debe arrancar mientras a sigue trabajando").not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(30);
  expect(b).toHaveBeenCalledTimes(1);
});

test("secuencial: tarda la suma de los tiempos y respeta el orden", async () => {
  let resultado;
  secuencial([tarea("a", 30), tarea("b", 30)]).then((r) => {
    resultado = r;
  });

  await vi.advanceTimersByTimeAsync(59);
  expect(resultado, "a los 59 ms todavía no debería terminar").toBeUndefined();
  await vi.advanceTimersByTimeAsync(1);
  expect(resultado).toEqual(["a", "b"]);
});

test("paralelo: arranca todas las tareas de inmediato", async () => {
  const a = tarea("a", 30);
  const b = tarea("b", 30);
  paralelo([a, b]);

  await vi.advanceTimersByTimeAsync(0);
  expect(a).toHaveBeenCalledTimes(1);
  expect(b, "en paralelo, b arranca sin esperar a a").toHaveBeenCalledTimes(1);
});

test("paralelo: tarda lo de la más lenta y mantiene el orden de las tareas", async () => {
  let resultado;
  paralelo([tarea("a", 50), tarea("b", 20)]).then((r) => {
    resultado = r;
  });

  await vi.advanceTimersByTimeAsync(49);
  expect(resultado, "a los 49 ms la tarea lenta sigue trabajando").toBeUndefined();
  await vi.advanceTimersByTimeAsync(1);
  expect(resultado).toEqual(["a", "b"]);
});

test("con un arreglo vacío, las dos se cumplen con []", async () => {
  await expect(secuencial([])).resolves.toEqual([]);
  await expect(paralelo([])).resolves.toEqual([]);
});
