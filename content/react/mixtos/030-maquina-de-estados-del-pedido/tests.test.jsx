// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { siguiente, Checkout } from "./solucion.jsx";

const botones = () => screen.queryAllByRole("button").map((b) => b.textContent);

test("siguiente sigue las transiciones permitidas", () => {
  expect(siguiente("carrito", "pagar")).toBe("pago");
  expect(siguiente("pago", "confirmar")).toBe("confirmado");
  expect(siguiente("pago", "volver")).toBe("carrito");
});

test("siguiente ignora eventos no permitidos o estados desconocidos", () => {
  expect(siguiente("carrito", "confirmar")).toBe("carrito");
  expect(siguiente("confirmado", "pagar")).toBe("confirmado");
  expect(siguiente("inventado", "pagar")).toBe("inventado");
});

test("Checkout arranca en el carrito con solo el botón pagar", () => {
  render(<Checkout />);
  expect(screen.getByText("Paso: carrito")).toBeTruthy();
  expect(botones()).toEqual(["pagar"]);
});

test("en el pago se puede confirmar o volver", () => {
  render(<Checkout />);
  fireEvent.click(screen.getByText("pagar"));
  expect(screen.getByText("Paso: pago")).toBeTruthy();
  expect(botones()).toEqual(["confirmar", "volver"]);
  fireEvent.click(screen.getByText("volver"));
  expect(screen.getByText("Paso: carrito")).toBeTruthy();
});

test("al confirmar llega al final y ya no hay botones", () => {
  render(<Checkout />);
  fireEvent.click(screen.getByText("pagar"));
  fireEvent.click(screen.getByText("confirmar"));
  expect(screen.getByText("Paso: confirmado")).toBeTruthy();
  expect(screen.queryAllByRole("button").length).toBe(0);
});
