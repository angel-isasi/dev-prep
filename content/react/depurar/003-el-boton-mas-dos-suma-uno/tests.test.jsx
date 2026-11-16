// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Asistentes } from "./solucion.jsx";

const texto = () => screen.getByText(/Asistentes:/).textContent;

test('"+2" suma dos personas, no una', () => {
  render(<Asistentes />);
  fireEvent.click(screen.getByRole("button", { name: "+2" }));
  expect(texto()).toBe("Asistentes: 2");
});

test("empieza en 0", () => {
  render(<Asistentes />);
  expect(texto()).toBe("Asistentes: 0");
});

test('"+1" suma una persona', () => {
  render(<Asistentes />);
  fireEvent.click(screen.getByRole("button", { name: "+1" }));
  expect(texto()).toBe("Asistentes: 1");
});

test("combina los dos botones", () => {
  render(<Asistentes />);
  fireEvent.click(screen.getByRole("button", { name: "+2" }));
  fireEvent.click(screen.getByRole("button", { name: "+1" }));
  fireEvent.click(screen.getByRole("button", { name: "+2" }));
  expect(texto()).toBe("Asistentes: 5");
});
