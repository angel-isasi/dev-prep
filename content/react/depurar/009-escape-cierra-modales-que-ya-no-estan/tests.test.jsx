// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./solucion.jsx";

const escape = () => fireEvent.keyDown(window, { key: "Escape" });

test("después de cerrar el modal, Escape ya no hace nada", () => {
  const onCerrar = vi.fn();
  const { unmount } = render(<Modal titulo="Confirmar" onCerrar={onCerrar} />);
  unmount();
  escape();
  expect(onCerrar).not.toHaveBeenCalled();
});

test("al cambiar onCerrar, Escape llama solo al nuevo", () => {
  const primero = vi.fn();
  const segundo = vi.fn();
  const { rerender } = render(<Modal titulo="Confirmar" onCerrar={primero} />);
  rerender(<Modal titulo="Confirmar" onCerrar={segundo} />);
  escape();
  expect(primero).not.toHaveBeenCalled();
  expect(segundo).toHaveBeenCalledTimes(1);
});

test("con el modal abierto, Escape lo cierra una vez", () => {
  const onCerrar = vi.fn();
  render(<Modal titulo="Confirmar" onCerrar={onCerrar} />);
  escape();
  expect(onCerrar).toHaveBeenCalledTimes(1);
});

test("otras teclas no lo cierran", () => {
  const onCerrar = vi.fn();
  render(<Modal titulo="Confirmar" onCerrar={onCerrar} />);
  fireEvent.keyDown(window, { key: "Enter" });
  expect(onCerrar).not.toHaveBeenCalled();
});

test('el botón "Cerrar" también lo cierra', () => {
  const onCerrar = vi.fn();
  render(<Modal titulo="Confirmar" onCerrar={onCerrar} />);
  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(onCerrar).toHaveBeenCalledTimes(1);
});
