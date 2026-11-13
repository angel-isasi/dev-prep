// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./solucion.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function avanzar(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

test("al inicio devuelve el valor tal cual", () => {
  const { result } = renderHook(() => useDebounce("hola", 300));
  expect(result.current).toBe("hola");
});

test("no cambia antes de que pase el tiempo", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
    initialProps: { v: "a" },
  });
  rerender({ v: "ab" });
  avanzar(299);
  expect(result.current).toBe("a");
});

test("cambia cuando pasan los milisegundos indicados", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
    initialProps: { v: "a" },
  });
  rerender({ v: "ab" });
  avanzar(300);
  expect(result.current).toBe("ab");
});

test("si el valor cambia antes de tiempo, la espera se reinicia y solo queda el último", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
    initialProps: { v: "a" },
  });
  rerender({ v: "ab" });
  avanzar(200);
  rerender({ v: "abc" });
  avanzar(200);
  expect(result.current).toBe("a");
  avanzar(100);
  expect(result.current).toBe("abc");
});

test("respeta el tiempo que se le pasa", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 1000), {
    initialProps: { v: "x" },
  });
  rerender({ v: "y" });
  avanzar(500);
  expect(result.current).toBe("x");
  avanzar(500);
  expect(result.current).toBe("y");
});

test("sin el segundo parámetro espera 300 ms", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v), {
    initialProps: { v: 1 },
  });
  rerender({ v: 2 });
  avanzar(299);
  expect(result.current).toBe(1);
  avanzar(1);
  expect(result.current).toBe(2);
});
