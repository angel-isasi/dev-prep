// @vitest-environment jsdom
import { test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrevio } from "./solucion.jsx";

function montar(valorInicial) {
  return renderHook(({ v }) => usePrevio(v), { initialProps: { v: valorInicial } });
}

test("en el primer render devuelve undefined", () => {
  const { result } = montar(1);
  expect(result.current).toBe(undefined);
});

test("devuelve el valor del render anterior", () => {
  const { result, rerender } = montar(1);
  rerender({ v: 2 });
  expect(result.current).toBe(1);
});

test("va un paso atrás en cada render", () => {
  const { result, rerender } = montar(1);
  rerender({ v: 2 });
  rerender({ v: 3 });
  expect(result.current).toBe(2);
});

test("funciona con textos", () => {
  const { result, rerender } = montar("Margarita");
  rerender({ v: "Pepperoni" });
  expect(result.current).toBe("Margarita");
  rerender({ v: "Hawaiana" });
  expect(result.current).toBe("Pepperoni");
});
