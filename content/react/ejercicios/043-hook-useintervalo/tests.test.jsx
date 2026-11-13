// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { useIntervalo } from "./solucion.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("usa siempre el callback más reciente (sin valores viejos)", () => {
  const { result } = renderHook(() => {
    const [n, setN] = useState(0);
    useIntervalo(() => setN(n + 1), 1000);
    return n;
  });
  act(() => vi.advanceTimersByTime(1000));
  act(() => vi.advanceTimersByTime(1000));
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current).toBe(3);
});

test("con ms = null está pausado", () => {
  const callback = vi.fn();
  renderHook(() => useIntervalo(callback, null));
  act(() => vi.advanceTimersByTime(5000));
  expect(callback).not.toHaveBeenCalled();
});

test("al desmontar deja de llamar al callback", () => {
  const callback = vi.fn();
  const { unmount } = renderHook(() => useIntervalo(callback, 1000));
  act(() => vi.advanceTimersByTime(1000));
  expect(callback).toHaveBeenCalledTimes(1);
  unmount();
  act(() => vi.advanceTimersByTime(3000));
  expect(callback).toHaveBeenCalledTimes(1);
});

test("cambiar el callback no reinicia la cuenta del intervalo", () => {
  const primero = vi.fn();
  const segundo = vi.fn();
  const { rerender } = renderHook(({ cb }) => useIntervalo(cb, 1000), {
    initialProps: { cb: primero },
  });
  act(() => vi.advanceTimersByTime(600));
  rerender({ cb: segundo });
  act(() => vi.advanceTimersByTime(400)); // se cumple el primer segundo
  expect(primero).not.toHaveBeenCalled();
  expect(segundo).toHaveBeenCalledTimes(1);
});

test("cambiar ms reinicia el intervalo con el nuevo tiempo", () => {
  const callback = vi.fn();
  const { rerender } = renderHook(({ ms }) => useIntervalo(callback, ms), {
    initialProps: { ms: 1000 },
  });
  rerender({ ms: 200 });
  act(() => vi.advanceTimersByTime(1000));
  expect(callback).toHaveBeenCalledTimes(5);
});
