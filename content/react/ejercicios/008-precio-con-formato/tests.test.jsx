// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Precio } from "./solucion.jsx";

// \s acepta tanto un espacio normal como uno "duro" entre S/ y el número.
test("pone separador de miles y 2 decimales", () => {
  render(<Precio monto={1234.5} />);
  expect(screen.getByText(/1,234\.50/)).toBeTruthy();
});

test("muestra el símbolo S/ delante", () => {
  render(<Precio monto={1234.5} />);
  expect(screen.getByText(/^S\/\s?1,234\.50$/)).toBeTruthy();
});

test("completa los decimales en montos enteros", () => {
  render(<Precio monto={28} />);
  expect(screen.getByText(/^S\/\s?28\.00$/)).toBeTruthy();
});

test("formatea montos grandes", () => {
  render(<Precio monto={1000000} />);
  expect(screen.getByText(/^S\/\s?1,000,000\.00$/)).toBeTruthy();
});

test("el precio va en un <span>", () => {
  render(<Precio monto={0} />);
  expect(screen.getByText(/0\.00/).tagName).toBe("SPAN");
});
