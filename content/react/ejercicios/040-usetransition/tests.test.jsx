// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pestanas } from "./solucion.jsx";

test('al inicio está en el menú: "Viendo: menu"', () => {
  render(<Pestanas />);
  expect(screen.getByText("Viendo: menu")).toBeTruthy();
  expect(screen.getByText("Menú").getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText("Pedidos").getAttribute("aria-pressed")).toBe("false");
});

test('clic en "Pedidos" cambia a "Viendo: pedidos"', async () => {
  render(<Pestanas />);
  fireEvent.click(screen.getByText("Pedidos"));
  expect(await screen.findByText("Viendo: pedidos")).toBeTruthy();
  expect(screen.queryByText("Cambiando…")).toBeNull();
});

test("el botón activo cambia con la pestaña", async () => {
  render(<Pestanas />);
  fireEvent.click(screen.getByText("Pedidos"));
  await screen.findByText("Viendo: pedidos");
  expect(screen.getByText("Pedidos").getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText("Menú").getAttribute("aria-pressed")).toBe("false");
});

test('se puede volver al menú', async () => {
  render(<Pestanas />);
  fireEvent.click(screen.getByText("Pedidos"));
  await screen.findByText("Viendo: pedidos");
  fireEvent.click(screen.getByText("Menú"));
  expect(await screen.findByText("Viendo: menu")).toBeTruthy();
});
