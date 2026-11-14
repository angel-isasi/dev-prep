import { test, expect, expectTypeOf, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./solucion";

// Relojes falsos: el tiempo solo avanza cuando lo pedimos con vi.advanceTimersByTime.
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

test("no llama a la función antes de que pase el tiempo", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("re");
  vi.advanceTimersByTime(299);
  expect(buscar).not.toHaveBeenCalled();
});

test("después del tiempo la llama una sola vez, con los argumentos de la última llamada", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("r");
  buscarConEspera("re");
  buscarConEspera("rea");
  vi.advanceTimersByTime(300);
  expect(buscar).toHaveBeenCalledTimes(1);
  expect(buscar).toHaveBeenCalledWith("rea");
});

test("cada llamada reinicia la espera", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("r");
  vi.advanceTimersByTime(200);
  buscarConEspera("re"); // reinicia: ahora faltan 300 ms desde aquí
  vi.advanceTimersByTime(200);
  expect(buscar).not.toHaveBeenCalled();
  vi.advanceTimersByTime(100);
  expect(buscar).toHaveBeenCalledWith("re");
});

test("pasa todos los argumentos", () => {
  const guardar = vi.fn();
  const guardarConEspera = debounce(guardar, 100);
  guardarConEspera("nota-1", 42, { urgente: true });
  vi.advanceTimersByTime(100);
  expect(guardar).toHaveBeenCalledWith("nota-1", 42, { urgente: true });
});

test("llamadas separadas por más del tiempo se ejecutan las dos", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("react");
  vi.advanceTimersByTime(300);
  buscarConEspera("vue");
  vi.advanceTimersByTime(300);
  expect(buscar.mock.calls).toEqual([["react"], ["vue"]]);
});

test("cancelar descarta la llamada pendiente", () => {
  const buscar = vi.fn();
  const buscarConEspera = debounce(buscar, 300);
  buscarConEspera("rea");
  buscarConEspera.cancelar();
  vi.advanceTimersByTime(1000);
  expect(buscar).not.toHaveBeenCalled();
});

test("conserva los tipos de los argumentos (lo revisa tsc)", () => {
  const mover = (x: number, y: number, etiqueta: string) => {
    void [x, y, etiqueta];
  };
  const moverConEspera = debounce(mover, 50);
  expectTypeOf(moverConEspera).parameters.toEqualTypeOf<[x: number, y: number, etiqueta: string]>();
  expectTypeOf(moverConEspera.cancelar).toEqualTypeOf<() => void>();
  const probar = () => {
    // @ts-expect-error x debe ser number
    moverConEspera("10", 20, "a");
    // @ts-expect-error falta la etiqueta
    moverConEspera(10, 20);
  };
  expect(typeof probar).toBe("function");
});
