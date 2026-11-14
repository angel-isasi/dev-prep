import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { reintentar } from "./solucion.js";

// Temporizadores falsos: el tiempo solo avanza cuando el test lo pide.
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

/** Sigue una promesa sin que su rechazo quede "suelto": anota cómo terminó. */
function observar(promesa) {
  const estado = { terminada: false, valor: undefined, error: undefined };
  estado.fin = promesa.then(
    (valor) => Object.assign(estado, { terminada: true, valor }),
    (error) => Object.assign(estado, { terminada: true, error }),
  );
  return estado;
}

/** Una tarea que falla las primeras `fallos` veces ("fallo 1", "fallo 2"...) y luego devuelve `valor`. */
function tareaQueFalla(fallos, valor = "ok") {
  let llamadas = 0;
  return vi.fn(async () => {
    llamadas++;
    if (llamadas <= fallos) throw new Error(`fallo ${llamadas}`);
    return valor;
  });
}

test("si sale bien a la primera, devuelve el valor y no reintenta", async () => {
  const tarea = tareaQueFalla(0, { estado: "aprobado" });
  const r = observar(reintentar(tarea));
  await vi.advanceTimersByTimeAsync(0);
  await r.fin;
  expect(r.valor).toEqual({ estado: "aprobado" });
  expect(tarea).toHaveBeenCalledTimes(1);
});

test("reintenta hasta que sale bien y devuelve ese valor", async () => {
  const tarea = tareaQueFalla(2, "pagado");
  const r = observar(reintentar(tarea, { intentos: 3, esperaInicial: 100 }));
  await vi.advanceTimersByTimeAsync(300); // 100 + 200
  await r.fin;
  expect(r.error).toBeUndefined();
  expect(r.valor).toBe("pagado");
  expect(tarea).toHaveBeenCalledTimes(3);
});

test("la espera se duplica: 100 ms y luego 200 ms", async () => {
  const tarea = tareaQueFalla(10);
  const r = observar(reintentar(tarea, { intentos: 3, esperaInicial: 100 }));

  await vi.advanceTimersByTimeAsync(99);
  expect(tarea).toHaveBeenCalledTimes(1); // todavía esperando los primeros 100 ms
  await vi.advanceTimersByTimeAsync(1);
  expect(tarea).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(199);
  expect(tarea).toHaveBeenCalledTimes(2); // ahora la espera es de 200 ms
  await vi.advanceTimersByTimeAsync(1);
  expect(tarea).toHaveBeenCalledTimes(3);

  await r.fin;
});

test("si fallan todos, rechaza con el error del ÚLTIMO intento", async () => {
  const tarea = tareaQueFalla(10);
  const r = observar(reintentar(tarea, { intentos: 4, esperaInicial: 10 }));
  await vi.advanceTimersByTimeAsync(70); // 10 + 20 + 40
  await r.fin;
  expect(r.error).toBeInstanceOf(Error);
  expect(r.error.message).toBe("fallo 4");
  expect(tarea).toHaveBeenCalledTimes(4);
});

test("sin opciones usa 3 intentos y 100 ms de espera inicial", async () => {
  const tarea = tareaQueFalla(10);
  const r = observar(reintentar(tarea));
  await vi.advanceTimersByTimeAsync(299);
  expect(tarea).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(1);
  await r.fin;
  expect(tarea).toHaveBeenCalledTimes(3);
  expect(r.error?.message).toBe("fallo 3");
});

test("después del último intento no espera: rechaza de inmediato", async () => {
  const tarea = tareaQueFalla(10);
  const r = observar(reintentar(tarea, { intentos: 2, esperaInicial: 100 }));
  await vi.advanceTimersByTimeAsync(100);
  expect(tarea).toHaveBeenCalledTimes(2);
  expect(r.terminada).toBe(true);
  expect(r.error?.message).toBe("fallo 2");
});
