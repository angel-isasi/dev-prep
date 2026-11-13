// @vitest-environment jsdom
import { test, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useContador } from "./solucion.jsx";

test("sin argumentos empieza en 0 y puede bajar a negativos", () => {
  const { result } = renderHook(() => useContador());
  expect(result.current.cuenta).toBe(0);
  act(() => result.current.restar());
  expect(result.current.cuenta).toBe(-1);
});

test("dos sumar en el mismo act cuentan los dos", () => {
  const { result } = renderHook(() => useContador({ inicial: 5 }));
  act(() => {
    result.current.sumar();
    result.current.sumar();
  });
  expect(result.current.cuenta).toBe(7);
});

test("sumar nunca pasa del máximo", () => {
  const { result } = renderHook(() => useContador({ inicial: 1, min: 1, max: 2 }));
  act(() => {
    result.current.sumar();
    result.current.sumar();
  });
  expect(result.current.cuenta).toBe(2);
});

test("restar nunca baja del mínimo", () => {
  const { result } = renderHook(() => useContador({ inicial: 2, min: 1, max: 2 }));
  act(() => {
    result.current.restar();
    result.current.restar();
  });
  expect(result.current.cuenta).toBe(1);
});

test("reiniciar vuelve al valor inicial", () => {
  const { result } = renderHook(() => useContador({ inicial: 3 }));
  act(() => result.current.sumar());
  act(() => result.current.sumar());
  expect(result.current.cuenta).toBe(5);
  act(() => result.current.reiniciar());
  expect(result.current.cuenta).toBe(3);
});
