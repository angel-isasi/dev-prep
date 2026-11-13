// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFetch } from "./solucion.jsx";

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

// Una respuesta falsa de fetch que devuelve { url } como JSON.
const respuestaOk = (url) => ({ ok: true, status: 200, json: async () => ({ url }) });

test("empieza cargando y luego entrega los datos", async () => {
  globalThis.fetch = vi.fn(async (url) => respuestaOk(url));
  const { result } = renderHook(() => useFetch("/a"));
  expect(result.current.cargando).toBe(true);
  expect(result.current.datos).toBeNull();
  await waitFor(() => expect(result.current.datos).toEqual({ url: "/a" }));
  expect(result.current.cargando).toBe(false);
  expect(result.current.error).toBeNull();
  expect(globalThis.fetch).toHaveBeenCalledWith("/a");
});

test("si la url cambia vuelve a pedir", async () => {
  globalThis.fetch = vi.fn(async (url) => respuestaOk(url));
  const { result, rerender } = renderHook(({ url }) => useFetch(url), {
    initialProps: { url: "/a" },
  });
  await waitFor(() => expect(result.current.datos).toEqual({ url: "/a" }));
  rerender({ url: "/b" });
  await waitFor(() => expect(result.current.datos).toEqual({ url: "/b" }));
  expect(globalThis.fetch).toHaveBeenCalledTimes(2);
});

test("un error HTTP (404) llega como error, sin datos", async () => {
  globalThis.fetch = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
  const { result } = renderHook(() => useFetch("/no-existe"));
  await waitFor(() => expect(result.current.cargando).toBe(false));
  expect(result.current.datos).toBeNull();
  expect(result.current.error.message).toBe("HTTP 404");
});

test("un fallo de red también llega como error", async () => {
  globalThis.fetch = vi.fn(async () => {
    throw new Error("Sin conexión");
  });
  const { result } = renderHook(() => useFetch("/a"));
  await waitFor(() => expect(result.current.cargando).toBe(false));
  expect(result.current.error.message).toBe("Sin conexión");
});

test("una respuesta vieja que llega tarde no pisa a la nueva", async () => {
  // Cada petición queda pendiente hasta que la resolvemos a mano.
  const pendientes = {};
  globalThis.fetch = vi.fn(
    (url) =>
      new Promise((resolver) => {
        pendientes[url] = () => resolver(respuestaOk(url));
      }),
  );
  const { result, rerender } = renderHook(({ url }) => useFetch(url), {
    initialProps: { url: "/lenta" },
  });
  rerender({ url: "/rapida" });

  await act(async () => {
    pendientes["/rapida"]();
  });
  await waitFor(() => expect(result.current.datos).toEqual({ url: "/rapida" }));

  // Ahora llega tarde la respuesta de la url anterior.
  await act(async () => {
    pendientes["/lenta"]();
    await new Promise((r) => setTimeout(r, 0));
  });
  expect(result.current.datos).toEqual({ url: "/rapida" });
});
