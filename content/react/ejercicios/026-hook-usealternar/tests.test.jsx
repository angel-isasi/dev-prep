// @vitest-environment jsdom
import { test, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAlternar } from "./solucion.jsx";

test("sin argumentos empieza en false", () => {
  const { result } = renderHook(() => useAlternar());
  expect(result.current[0]).toBe(false);
});

test("acepta un valor inicial", () => {
  const { result } = renderHook(() => useAlternar(true));
  expect(result.current[0]).toBe(true);
});

test("alternar cambia de false a true y de vuelta a false", () => {
  const { result } = renderHook(() => useAlternar());
  act(() => result.current[1]());
  expect(result.current[0]).toBe(true);
  act(() => result.current[1]());
  expect(result.current[0]).toBe(false);
});

test("dos llamadas seguidas en el mismo act se aplican las dos", () => {
  const { result } = renderHook(() => useAlternar());
  act(() => {
    result.current[1]();
    result.current[1]();
  });
  expect(result.current[0]).toBe(false);
});

test("alternar es la misma función en todos los renders", () => {
  const { result } = renderHook(() => useAlternar());
  const primera = result.current[1];
  act(() => result.current[1]());
  expect(result.current[1]).toBe(primera);
});
