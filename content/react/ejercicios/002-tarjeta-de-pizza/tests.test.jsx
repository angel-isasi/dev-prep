// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pizza } from "./solucion.jsx";

test("muestra el precio con S/ y 2 decimales", () => {
  render(<Pizza nombre="Margarita" descripcion="Tomate y albahaca" precio={28} />);
  expect(screen.getByText("S/ 28.00")).toBeTruthy();
});

test("completa los decimales que faltan", () => {
  render(<Pizza nombre="Hawaiana" descripcion="Jamón y piña" precio={31.5} />);
  expect(screen.getByText("S/ 31.50")).toBeTruthy();
});

test("el nombre es un título <h2>", () => {
  render(<Pizza nombre="Margarita" descripcion="Tomate y albahaca" precio={28} />);
  expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Margarita");
});

test("muestra la descripción", () => {
  render(<Pizza nombre="Pepperoni" descripcion="Pepperoni y mozzarella" precio={32} />);
  expect(screen.getByText("Pepperoni y mozzarella")).toBeTruthy();
});

test("todo va dentro de un <article>", () => {
  render(<Pizza nombre="Margarita" descripcion="Tomate y albahaca" precio={28} />);
  const tarjeta = screen.getByRole("article");
  expect(tarjeta.textContent).toContain("Margarita");
  expect(tarjeta.textContent).toContain("Tomate y albahaca");
  expect(tarjeta.textContent).toContain("S/ 28.00");
});
