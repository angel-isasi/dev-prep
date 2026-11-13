// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { useTecla, Ayuda } from "./solucion.jsx";

test("al inicio la ayuda está oculta", () => {
  render(<Ayuda />);
  expect(screen.queryByText("Atajos de teclado")).toBeNull();
});

test('"?" muestra la ayuda', () => {
  render(<Ayuda />);
  fireEvent.keyDown(document, { key: "?" });
  expect(screen.getByText("Atajos de teclado")).toBeTruthy();
});

test('"?" otra vez la oculta, y otras teclas no hacen nada', () => {
  render(<Ayuda />);
  fireEvent.keyDown(document, { key: "?" });
  fireEvent.keyDown(document, { key: "a" });
  expect(screen.getByText("Atajos de teclado")).toBeTruthy();
  fireEvent.keyDown(document, { key: "?" });
  expect(screen.queryByText("Atajos de teclado")).toBeNull();
});

test("el hook llama a la acción con el evento solo para su tecla", () => {
  const accion = vi.fn();
  renderHook(() => useTecla("Escape", accion));
  fireEvent.keyDown(document, { key: "Enter" });
  expect(accion).not.toHaveBeenCalled();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(accion).toHaveBeenCalledTimes(1);
  expect(accion.mock.calls[0][0].key).toBe("Escape");
});

test("al desmontar deja de escuchar el teclado", () => {
  const accion = vi.fn();
  const { unmount } = renderHook(() => useTecla("Escape", accion));
  unmount();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(accion).not.toHaveBeenCalled();
});
