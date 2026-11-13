// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./solucion.jsx";

function abrir(onCerrar = vi.fn()) {
  return render(
    <Modal abierto titulo="Votar" onCerrar={onCerrar}>
      <p>¿Confirmas tu voto?</p>
    </Modal>
  );
}

test("cerrado no pinta nada ni escucha el teclado", () => {
  const onCerrar = vi.fn();
  render(
    <Modal abierto={false} titulo="Votar" onCerrar={onCerrar}>
      <p>¿Confirmas tu voto?</p>
    </Modal>
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByText("¿Confirmas tu voto?")).toBeNull();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onCerrar).not.toHaveBeenCalled();
});

test("abierto muestra un diálogo con su título y contenido", () => {
  abrir();
  const dialogo = screen.getByRole("dialog", { name: "Votar" });
  expect(dialogo.getAttribute("aria-modal")).toBe("true");
  expect(screen.getByRole("heading", { name: "Votar" })).toBeTruthy();
  expect(screen.getByText("¿Confirmas tu voto?")).toBeTruthy();
});

test("un clic dentro del modal no lo cierra", () => {
  const onCerrar = vi.fn();
  abrir(onCerrar);
  fireEvent.click(screen.getByText("¿Confirmas tu voto?"));
  fireEvent.click(screen.getByRole("dialog"));
  expect(onCerrar).not.toHaveBeenCalled();
});

test("Escape lo cierra, otras teclas no", () => {
  const onCerrar = vi.fn();
  abrir(onCerrar);
  fireEvent.keyDown(document, { key: "Enter" });
  fireEvent.keyDown(document, { key: "a" });
  expect(onCerrar).not.toHaveBeenCalled();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onCerrar).toHaveBeenCalledTimes(1);
});

test('el clic en el fondo y el botón "Cerrar" lo cierran', () => {
  const onCerrar = vi.fn();
  abrir(onCerrar);
  fireEvent.click(screen.getByTestId("fondo"));
  expect(onCerrar).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("Cerrar"));
  expect(onCerrar).toHaveBeenCalledTimes(2);
});

test("al desmontarse quita el listener de Escape", () => {
  const onCerrar = vi.fn();
  const { unmount } = abrir(onCerrar);
  unmount();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onCerrar).not.toHaveBeenCalled();
});
