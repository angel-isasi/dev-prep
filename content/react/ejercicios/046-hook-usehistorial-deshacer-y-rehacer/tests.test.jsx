// @vitest-environment jsdom
import { test, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHistorial } from "./solucion.jsx";

test("empieza con el valor inicial y sin historial", () => {
  const { result } = renderHook(() => useHistorial("margarita"));
  expect(result.current.valor).toBe("margarita");
  expect(result.current.puedeDeshacer).toBe(false);
  expect(result.current.puedeRehacer).toBe(false);
});

test("deshacer vuelve al valor anterior y rehacer lo recupera", () => {
  const { result } = renderHook(() => useHistorial("margarita"));
  act(() => result.current.fijar("pepperoni"));
  act(() => result.current.fijar("hawaiana"));
  act(() => result.current.deshacer());
  expect(result.current.valor).toBe("pepperoni");
  expect(result.current.puedeRehacer).toBe(true);
  act(() => result.current.rehacer());
  expect(result.current.valor).toBe("hawaiana");
  expect(result.current.puedeRehacer).toBe(false);
});

test("deshacer o rehacer sin historial no hace nada", () => {
  const { result } = renderHook(() => useHistorial("margarita"));
  act(() => result.current.deshacer());
  act(() => result.current.rehacer());
  expect(result.current.valor).toBe("margarita");
});

test("fijar algo nuevo borra el futuro", () => {
  const { result } = renderHook(() => useHistorial("margarita"));
  act(() => result.current.fijar("pepperoni"));
  act(() => result.current.fijar("hawaiana"));
  act(() => result.current.deshacer());
  act(() => result.current.fijar("vegana"));
  expect(result.current.valor).toBe("vegana");
  expect(result.current.puedeRehacer).toBe(false);
  act(() => result.current.rehacer());
  expect(result.current.valor).toBe("vegana");
  act(() => result.current.deshacer());
  expect(result.current.valor).toBe("pepperoni");
});

test("dos deshacer en el mismo act retroceden dos pasos", () => {
  const { result } = renderHook(() => useHistorial(1));
  act(() => result.current.fijar(2));
  act(() => result.current.fijar(3));
  act(() => {
    result.current.deshacer();
    result.current.deshacer();
  });
  expect(result.current.valor).toBe(1);
  expect(result.current.puedeDeshacer).toBe(false);
});
