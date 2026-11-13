// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Estado } from "./solucion.jsx";

test('con abierto={false} muestra "Cerrado"', () => {
  render(<Estado abierto={false} />);
  expect(screen.getByText("Cerrado")).toBeTruthy();
  expect(screen.queryByText("Abierto ahora")).toBeNull();
});

test('con abierto={true} muestra "Abierto ahora"', () => {
  render(<Estado abierto={true} />);
  expect(screen.getByText("Abierto ahora")).toBeTruthy();
  expect(screen.queryByText("Cerrado")).toBeNull();
});

test("el texto va dentro de un párrafo", () => {
  render(<Estado abierto={true} />);
  expect(screen.getByText("Abierto ahora").tagName).toBe("P");
});

test("cambia el texto cuando cambia la prop", () => {
  const { rerender } = render(<Estado abierto={true} />);
  expect(screen.getByText("Abierto ahora")).toBeTruthy();
  rerender(<Estado abierto={false} />);
  expect(screen.getByText("Cerrado")).toBeTruthy();
  expect(screen.queryByText("Abierto ahora")).toBeNull();
});
