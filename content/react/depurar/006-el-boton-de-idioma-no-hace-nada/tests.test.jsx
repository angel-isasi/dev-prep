// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { App } from "./solucion.jsx";

test('al hacer clic en "English", el saludo cambia a inglés', () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  expect(screen.getByRole("heading").textContent).toBe("Welcome");
});

test("empieza en español", () => {
  render(<App />);
  expect(screen.getByRole("heading").textContent).toBe("Bienvenido");
  expect(screen.getByRole("button").textContent).toBe("English");
});

test("el botón ofrece volver al español después de cambiar", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("Español");
});

test("dos clics vuelven al español", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("heading").textContent).toBe("Bienvenido");
});
