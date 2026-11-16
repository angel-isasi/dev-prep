// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRecurso, limpiarCache } from "./solucion.jsx";

// Reloj falso: las esperas entre reintentos pasan al instante.
beforeEach(() => {
  vi.useFakeTimers();
  limpiarCache();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const ok = (cuerpo) => ({ ok: true, status: 200, json: async () => cuerpo });
const http = (status) => ({ ok: false, status, json: async () => ({ error: "x" }) });

/** Avanza el reloj falso y deja que terminen las promesas pendientes. */
async function avanzar(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

test("empieza cargando, entrega los datos y una segunda vez usa la caché (sin otra petición)", async () => {
  const fetchFalso = vi.fn(async () => ok([{ id: 1 }]));
  vi.stubGlobal("fetch", fetchFalso);

  const primero = renderHook(() => useRecurso("/api/practica/tareas"));
  expect(primero.result.current.cargando).toBe(true);
  expect(primero.result.current.datos).toBeNull();
  await avanzar();
  expect(primero.result.current).toMatchObject({ datos: [{ id: 1 }], error: null, cargando: false });
  expect(typeof primero.result.current.recargar).toBe("function");
  primero.unmount();

  // Otro componente con la misma url: datos desde el primer render.
  const segundo = renderHook(() => useRecurso("/api/practica/tareas"));
  expect(segundo.result.current).toMatchObject({ datos: [{ id: 1 }], error: null, cargando: false });
  await avanzar(5000);
  expect(fetchFalso).toHaveBeenCalledTimes(1);
});

test("la caché es por url: otra url sí hace su propia petición", async () => {
  const fetchFalso = vi.fn(async (url) => ok({ url }));
  vi.stubGlobal("fetch", fetchFalso);

  const { result, rerender } = renderHook(({ url }) => useRecurso(url), {
    initialProps: { url: "/api/practica/productos/1" },
  });
  await avanzar();
  rerender({ url: "/api/practica/productos/2" });
  await avanzar();
  expect(result.current.datos).toEqual({ url: "/api/practica/productos/2" });

  rerender({ url: "/api/practica/productos/1" });
  await avanzar();
  expect(result.current.datos).toEqual({ url: "/api/practica/productos/1" });
  expect(fetchFalso).toHaveBeenCalledTimes(2);
});

test("ante un 500 reintenta con espera creciente: 500 ms y luego 1000 ms", async () => {
  const fetchFalso = vi
    .fn()
    .mockResolvedValueOnce(http(500))
    .mockRejectedValueOnce(new TypeError("Failed to fetch"))
    .mockResolvedValueOnce(ok({ nombre: "Hub USB-C" }));
  vi.stubGlobal("fetch", fetchFalso);

  const { result } = renderHook(() => useRecurso("/api/practica/productos/12"));
  await avanzar();
  expect(fetchFalso).toHaveBeenCalledTimes(1);
  expect(result.current.cargando).toBe(true);
  expect(result.current.error).toBeNull();

  await avanzar(499);
  expect(fetchFalso).toHaveBeenCalledTimes(1);
  await avanzar(1);
  expect(fetchFalso).toHaveBeenCalledTimes(2);

  await avanzar(999);
  expect(fetchFalso).toHaveBeenCalledTimes(2);
  await avanzar(1);
  expect(fetchFalso).toHaveBeenCalledTimes(3);
  expect(result.current).toMatchObject({ datos: { nombre: "Hub USB-C" }, error: null, cargando: false });
});

test("si los 3 intentos fallan entrega el error y no vuelve a intentar", async () => {
  const fetchFalso = vi.fn(async () => http(503));
  vi.stubGlobal("fetch", fetchFalso);

  const { result } = renderHook(() => useRecurso("/api/practica/tareas"));
  await avanzar(10_000);
  expect(fetchFalso).toHaveBeenCalledTimes(3);
  expect(result.current.cargando).toBe(false);
  expect(result.current.datos).toBeNull();
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.error.message).toBe("HTTP 503");

  await avanzar(60_000);
  expect(fetchFalso).toHaveBeenCalledTimes(3);
});

test("un 404 no se reintenta: el error llega de inmediato", async () => {
  const fetchFalso = vi.fn(async () => http(404));
  vi.stubGlobal("fetch", fetchFalso);

  const { result } = renderHook(() => useRecurso("/api/practica/productos/99"));
  await avanzar();
  expect(result.current.cargando).toBe(false);
  expect(result.current.error.message).toBe("HTTP 404");
  await avanzar(10_000);
  expect(fetchFalso).toHaveBeenCalledTimes(1);
});

test("recargar() ignora la caché, vuelve a pedir y actualiza los datos", async () => {
  const fetchFalso = vi
    .fn()
    .mockResolvedValueOnce(ok(["Repasar closures"]))
    .mockResolvedValueOnce(ok(["Repasar closures", "Estudiar fetch"]));
  vi.stubGlobal("fetch", fetchFalso);

  const { result } = renderHook(() => useRecurso("/api/practica/tareas"));
  await avanzar();
  expect(result.current.datos).toEqual(["Repasar closures"]);

  act(() => result.current.recargar());
  expect(result.current.cargando).toBe(true);
  await avanzar();
  expect(fetchFalso).toHaveBeenCalledTimes(2);
  expect(result.current).toMatchObject({ datos: ["Repasar closures", "Estudiar fetch"], cargando: false });

  // La caché quedó con los datos nuevos.
  const otro = renderHook(() => useRecurso("/api/practica/tareas"));
  expect(otro.result.current.datos).toEqual(["Repasar closures", "Estudiar fetch"]);
});

test("al desmontar (o cambiar de url) se cancelan los reintentos pendientes", async () => {
  const fetchFalso = vi.fn(async () => http(500));
  vi.stubGlobal("fetch", fetchFalso);

  const { unmount } = renderHook(() => useRecurso("/api/practica/tareas"));
  await avanzar();
  expect(fetchFalso).toHaveBeenCalledTimes(1);
  unmount();
  await avanzar(10_000);
  expect(fetchFalso).toHaveBeenCalledTimes(1);

  fetchFalso.mockClear();
  const { result, rerender } = renderHook(({ url }) => useRecurso(url), { initialProps: { url: "/a" } });
  await avanzar();
  fetchFalso.mockImplementation(async (url) => (url === "/b" ? ok("b") : http(500)));
  rerender({ url: "/b" });
  await avanzar(10_000);
  expect(fetchFalso.mock.calls.map((c) => c[0])).toEqual(["/a", "/b"]);
  expect(result.current.datos).toBe("b");
});
