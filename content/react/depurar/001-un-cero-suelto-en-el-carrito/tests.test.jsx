// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResumenCarrito } from "./solucion.jsx";

test("con el carrito vacío no aparece un 0 suelto", () => {
  const { container } = render(<ResumenCarrito cantidad={0} />);
  expect(container.textContent).toBe("Seguir comprando");
});

test("con productos muestra cuántos hay", () => {
  render(<ResumenCarrito cantidad={3} />);
  expect(screen.getByText("Productos en tu carrito: 3")).toBeTruthy();
});

test("con el carrito vacío no muestra el resumen", () => {
  render(<ResumenCarrito cantidad={0} />);
  expect(screen.queryByText(/Productos en tu carrito/)).toBeNull();
});

test("el botón aparece siempre", () => {
  render(<ResumenCarrito cantidad={0} />);
  expect(screen.getByRole("button", { name: "Seguir comprando" })).toBeTruthy();
});
