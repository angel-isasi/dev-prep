// @vitest-environment jsdom
import { test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TituloPedido } from "./solucion.jsx";

beforeEach(() => {
  document.title = "";
});

test('con 0 pizzas el título es "Padre Gino"', () => {
  render(<TituloPedido cantidad={0} />);
  expect(document.title).toBe("Padre Gino");
});

test("con pizzas muestra la cantidad entre paréntesis", () => {
  render(<TituloPedido cantidad={3} />);
  expect(document.title).toBe("(3) Padre Gino");
});

test("se actualiza cuando la cantidad cambia", () => {
  const { rerender } = render(<TituloPedido cantidad={0} />);
  rerender(<TituloPedido cantidad={3} />);
  expect(document.title).toBe("(3) Padre Gino");
});

test("vuelve a \"Padre Gino\" si la cantidad baja a 0", () => {
  const { rerender } = render(<TituloPedido cantidad={3} />);
  rerender(<TituloPedido cantidad={0} />);
  expect(document.title).toBe("Padre Gino");
});

test('en la página muestra "{cantidad} en el carrito"', () => {
  render(<TituloPedido cantidad={2} />);
  expect(screen.getByText("2 en el carrito")).toBeTruthy();
});
