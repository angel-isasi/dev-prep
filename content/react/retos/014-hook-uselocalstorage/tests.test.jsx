// @vitest-environment jsdom
import { test, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./solucion.jsx";

beforeEach(() => {
  localStorage.clear();
});

test("sin nada guardado devuelve el valor inicial", () => {
  const { result } = renderHook(() => useLocalStorage("favoritos", ["Drama"]));
  expect(result.current[0]).toEqual(["Drama"]);
});

test("el setter actualiza el valor como useState", () => {
  const { result } = renderHook(() => useLocalStorage("favoritos", []));
  act(() => result.current[1](["Terror"]));
  expect(result.current[0]).toEqual(["Terror"]);
});

test("guarda el valor en localStorage como JSON", () => {
  const { result } = renderHook(() => useLocalStorage("favoritos", []));
  act(() => result.current[1](["Drama", "Terror"]));
  expect(localStorage.getItem("favoritos")).toBe('["Drama","Terror"]');
});

test("el valor sobrevive a desmontar y volver a montar", () => {
  const primero = renderHook(() => useLocalStorage("favoritos", []));
  act(() => primero.result.current[1](["Drama"]));
  primero.unmount();

  const segundo = renderHook(() => useLocalStorage("favoritos", []));
  expect(segundo.result.current[0]).toEqual(["Drama"]);
});

test("acepta una función para actualizar a partir del valor anterior", () => {
  const { result } = renderHook(() => useLocalStorage("contador", 0));
  act(() => result.current[1]((n) => n + 1));
  act(() => result.current[1]((n) => n + 1));
  expect(result.current[0]).toBe(2);
  expect(localStorage.getItem("contador")).toBe("2");
});

test("si lo guardado no es JSON válido, usa el valor inicial sin romperse", () => {
  localStorage.setItem("favoritos", "{malo");
  const { result } = renderHook(() => useLocalStorage("favoritos", []));
  expect(result.current[0]).toEqual([]);
});
