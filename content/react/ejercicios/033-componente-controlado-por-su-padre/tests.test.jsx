// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Interruptor, Opciones } from "./solucion.jsx";

test("el interruptor muestra su etiqueta y su estado", () => {
  render(<Interruptor etiqueta="Delivery" activo={false} onCambio={() => {}} />);
  const boton = screen.getByRole("switch");
  expect(boton.textContent).toBe("Delivery: no");
  expect(boton.getAttribute("aria-checked")).toBe("false");
});

test("al hacer clic avisa con el valor contrario, pero no cambia solo", () => {
  const onCambio = vi.fn();
  render(<Interruptor etiqueta="Delivery" activo={false} onCambio={onCambio} />);
  fireEvent.click(screen.getByRole("switch"));
  expect(onCambio).toHaveBeenCalledWith(true);
  // El padre no actualizó `activo`: el interruptor sigue igual.
  expect(screen.getByRole("switch").textContent).toBe("Delivery: no");
});

test("activo={true} muestra sí y avisa con false", () => {
  const onCambio = vi.fn();
  render(<Interruptor etiqueta="Promo" activo={true} onCambio={onCambio} />);
  expect(screen.getByRole("switch").textContent).toBe("Promo: sí");
  expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  fireEvent.click(screen.getByRole("switch"));
  expect(onCambio).toHaveBeenCalledWith(false);
});

test("en Opciones, prender el delivery muestra el costo de envío", () => {
  render(<Opciones />);
  expect(screen.queryByText("Costo de envío: S/ 5")).toBeNull();
  fireEvent.click(screen.getByRole("switch"));
  expect(screen.getByText("Costo de envío: S/ 5")).toBeTruthy();
  expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
});

test("en Opciones, apagarlo otra vez oculta el costo", () => {
  render(<Opciones />);
  fireEvent.click(screen.getByRole("switch"));
  fireEvent.click(screen.getByRole("switch"));
  expect(screen.queryByText("Costo de envío: S/ 5")).toBeNull();
  expect(screen.getByRole("switch").textContent).toBe("Delivery: no");
});
