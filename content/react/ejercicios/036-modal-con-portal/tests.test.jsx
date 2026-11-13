// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal, Pagina } from "./solucion.jsx";

test("al inicio no hay diálogo", () => {
  render(<Pagina />);
  expect(screen.getByText("Ver pedido")).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
});

test('"Ver pedido" abre el diálogo con "Tu pedido"', () => {
  render(<Pagina />);
  fireEvent.click(screen.getByText("Ver pedido"));
  const dialogo = screen.getByRole("dialog");
  expect(dialogo.textContent).toContain("Tu pedido");
  expect(dialogo.getAttribute("aria-modal")).toBe("true");
});

test("el diálogo se dibuja fuera de #pagina, colgado de body", () => {
  render(<Pagina />);
  fireEvent.click(screen.getByText("Ver pedido"));
  const dialogo = screen.getByRole("dialog");
  expect(document.getElementById("pagina")).toBeTruthy();
  expect(dialogo.closest("#pagina")).toBeNull();
  expect(dialogo.parentElement).toBe(document.body);
});

test('"Cerrar" quita el diálogo del documento', () => {
  render(<Pagina />);
  fireEvent.click(screen.getByText("Ver pedido"));
  fireEvent.click(screen.getByText("Cerrar"));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByText("Tu pedido")).toBeNull();
});

test("Modal muestra sus children y llama a onCerrar", () => {
  const onCerrar = vi.fn();
  render(
    <Modal onCerrar={onCerrar}>
      <p>Hola</p>
    </Modal>,
  );
  expect(screen.getByRole("dialog").textContent).toContain("Hola");
  fireEvent.click(screen.getByText("Cerrar"));
  expect(onCerrar).toHaveBeenCalledTimes(1);
});
