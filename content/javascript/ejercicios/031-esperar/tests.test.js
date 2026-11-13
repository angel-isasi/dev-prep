import { test, expect, vi, afterEach } from "vitest";
import { esperar } from "./solucion.js";

afterEach(() => {
  vi.useRealTimers();
});

test("devuelve una promesa", () => {
  expect(esperar(10)).toBeInstanceOf(Promise);
});

test("con await, espera de verdad el tiempo pedido", async () => {
  const inicio = Date.now();
  await esperar(40);
  expect(Date.now() - inicio).toBeGreaterThanOrEqual(35);
});

test("no se cumple antes de tiempo, y se cumple justo al llegar", async () => {
  vi.useFakeTimers();
  let cumplida = false;
  esperar(100).then(() => {
    cumplida = true;
  });

  await vi.advanceTimersByTimeAsync(99);
  expect(cumplida).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(cumplida).toBe(true);
});

test("no bloquea: el código que sigue corre mientras se espera", async () => {
  const orden = [];
  const promesa = esperar(20).then(() => orden.push("terminó la espera"));
  orden.push("código siguiente");
  await promesa;
  expect(orden).toEqual(["código siguiente", "terminó la espera"]);
});
