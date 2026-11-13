// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Etiqueta } from "./solucion.jsx";

test('"picante" lleva la clase "etiqueta roja"', () => {
  render(<Etiqueta tipo="picante" />);
  expect(screen.getByText("picante").className).toBe("etiqueta roja");
});

test('"nuevo" lleva la clase "etiqueta verde"', () => {
  render(<Etiqueta tipo="nuevo" />);
  expect(screen.getByText("nuevo").className).toBe("etiqueta verde");
});

test('"agotado" lleva la clase "etiqueta gris"', () => {
  render(<Etiqueta tipo="agotado" />);
  expect(screen.getByText("agotado").className).toBe("etiqueta gris");
});

test('un tipo desconocido lleva solo "etiqueta"', () => {
  render(<Etiqueta tipo="vegano" />);
  expect(screen.getByText("vegano").className).toBe("etiqueta");
});

test("es un <span> con el tipo como texto", () => {
  render(<Etiqueta tipo="nuevo" />);
  const etiqueta = screen.getByText("nuevo");
  expect(etiqueta.tagName).toBe("SPAN");
  expect(etiqueta.textContent).toBe("nuevo");
});
