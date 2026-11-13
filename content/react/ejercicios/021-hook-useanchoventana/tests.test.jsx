// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnchoVentana } from "./solucion.jsx";

beforeEach(() => {
  window.innerWidth = 1024;
});

afterEach(() => {
  vi.restoreAllMocks();
});

function cambiarAncho(ancho) {
  act(() => {
    window.innerWidth = ancho;
    window.dispatchEvent(new Event("resize"));
  });
}

test("al inicio devuelve el ancho actual de la ventana", () => {
  const { result } = renderHook(() => useAnchoVentana());
  expect(result.current).toBe(1024);
});

test("se actualiza cuando la ventana cambia de tamaño", () => {
  const { result } = renderHook(() => useAnchoVentana());
  cambiarAncho(500);
  expect(result.current).toBe(500);
});

test("sigue actualizándose con varios cambios seguidos", () => {
  const { result } = renderHook(() => useAnchoVentana());
  cambiarAncho(800);
  cambiarAncho(375);
  expect(result.current).toBe(375);
});

test("al desmontar quita el mismo listener de resize que agregó", () => {
  const agregar = vi.spyOn(window, "addEventListener");
  const quitar = vi.spyOn(window, "removeEventListener");

  const { unmount } = renderHook(() => useAnchoVentana());
  const llamadaAgregar = agregar.mock.calls.find(([tipo]) => tipo === "resize");
  expect(llamadaAgregar).toBeTruthy();

  unmount();
  const llamadaQuitar = quitar.mock.calls.find(([tipo]) => tipo === "resize");
  expect(llamadaQuitar).toBeTruthy();
  expect(llamadaQuitar[1]).toBe(llamadaAgregar[1]);
});
