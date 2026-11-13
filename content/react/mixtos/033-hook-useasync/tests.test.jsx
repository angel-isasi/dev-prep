// @vitest-environment jsdom
import { test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAsync } from "./solucion.jsx";

async function doble(n) {
  if (n < 0) throw new Error("negativo");
  return n * 2;
}

test("empieza en la fase inicial", () => {
  const { result } = renderHook(() => useAsync(doble));
  expect(result.current).toMatchObject({ fase: "inicial", dato: null, error: null });
  expect(typeof result.current.ejecutar).toBe("function");
});

test("mientras espera la respuesta está en cargando", async () => {
  let responder;
  const lenta = () => new Promise((resolve) => (responder = resolve));
  const { result } = renderHook(() => useAsync(lenta));

  let promesa;
  act(() => {
    promesa = result.current.ejecutar();
  });
  expect(result.current.fase).toBe("cargando");

  await act(async () => {
    responder("hola");
    await promesa;
  });
  expect(result.current).toMatchObject({ fase: "listo", dato: "hola" });
});

test("si sale bien queda en listo con el dato, y ejecutar lo devuelve", async () => {
  const { result } = renderHook(() => useAsync(doble));
  let devuelto;
  await act(async () => {
    devuelto = await result.current.ejecutar(21);
  });
  expect(result.current).toMatchObject({ fase: "listo", dato: 42, error: null });
  expect(devuelto).toBe(42);
});

test("si falla queda en error sin relanzarlo", async () => {
  const { result } = renderHook(() => useAsync(doble));
  await act(async () => {
    await result.current.ejecutar(21);
  });
  await act(async () => {
    await expect(result.current.ejecutar(-1)).resolves.toBeUndefined();
  });
  expect(result.current.fase).toBe("error");
  expect(result.current.dato).toBeNull();
  expect(result.current.error.message).toBe("negativo");
});

test("ejecutar es la misma función entre renders", async () => {
  const { result, rerender } = renderHook(() => useAsync(doble));
  const primera = result.current.ejecutar;
  await act(async () => {
    await result.current.ejecutar(1);
  });
  rerender();
  expect(result.current.ejecutar).toBe(primera);
});
