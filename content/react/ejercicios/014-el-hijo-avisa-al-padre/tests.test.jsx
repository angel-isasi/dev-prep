// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BotonAgregar, Tienda } from "./solucion.jsx";

test('BotonAgregar muestra "Agregar {pizza}"', () => {
  render(<BotonAgregar pizza="Hawaiana" onAgregar={() => {}} />);
  expect(screen.getByRole("button").textContent).toBe("Agregar Hawaiana");
});

test("BotonAgregar llama a onAgregar con el nombre de la pizza", () => {
  const onAgregar = vi.fn();
  render(<BotonAgregar pizza="Pepperoni" onAgregar={onAgregar} />);
  fireEvent.click(screen.getByRole("button"));
  expect(onAgregar).toHaveBeenCalledTimes(1);
  expect(onAgregar).toHaveBeenCalledWith("Pepperoni");
});

test("Tienda no muestra mensaje antes de agregar", () => {
  render(<Tienda />);
  expect(screen.getByText("Agregar Margarita")).toBeTruthy();
  expect(screen.getByText("Agregar Pepperoni")).toBeTruthy();
  expect(screen.queryByText(/Agregaste/)).toBeNull();
});

test("al agregar una pizza, la Tienda la muestra", () => {
  render(<Tienda />);
  fireEvent.click(screen.getByText("Agregar Pepperoni"));
  expect(screen.getByText("Agregaste Pepperoni")).toBeTruthy();
});

test("la Tienda muestra solo la última pizza agregada", () => {
  render(<Tienda />);
  fireEvent.click(screen.getByText("Agregar Margarita"));
  fireEvent.click(screen.getByText("Agregar Pepperoni"));
  expect(screen.getByText("Agregaste Pepperoni")).toBeTruthy();
  expect(screen.queryByText("Agregaste Margarita")).toBeNull();
});
