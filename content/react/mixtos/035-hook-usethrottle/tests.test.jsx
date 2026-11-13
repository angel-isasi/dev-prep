// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThrottle } from "./solucion.jsx";

afterEach(() => {
  vi.useRealTimers();
});

function avanzar(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function montar(inicial) {
  return renderHook(({ v }) => useThrottle(v, 200), { initialProps: { v: inicial } });
}

test("en el primer render devuelve el valor tal cual", () => {
  vi.useFakeTimers();
  const { result } = montar("a");
  expect(result.current).toBe("a");
});

test("con cambios rápidos espera 200 ms y aplica el último", () => {
  vi.useFakeTimers();
  const { result, rerender } = montar("a");
  rerender({ v: "b" });
  rerender({ v: "c" });
  expect(result.current).toBe("a");
  avanzar(199);
  expect(result.current).toBe("a");
  avanzar(1);
  expect(result.current).toBe("c");
});

test("si los cambios no paran, igual se actualiza cada 200 ms", () => {
  vi.useFakeTimers();
  const { result, rerender } = montar("0");
  rerender({ v: "1" });
  avanzar(100);
  rerender({ v: "2" });
  expect(result.current).toBe("0");
  avanzar(100);
  expect(result.current).toBe("2");
  rerender({ v: "3" });
  avanzar(100);
  rerender({ v: "4" });
  avanzar(100);
  expect(result.current).toBe("4");
});

test("después de un rato quieto, un cambio se aplica al instante", () => {
  vi.useFakeTimers();
  const { result, rerender } = montar("a");
  avanzar(1000);
  rerender({ v: "b" });
  expect(result.current).toBe("b");
});
