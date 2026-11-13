// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tamano } from "./solucion.jsx";

function elegir(valor) {
  fireEvent.change(screen.getByLabelText("Tamaño"), { target: { value: valor } });
}

test("al inicio está elegida Mediana y cuesta S/ 28", () => {
  render(<Tamano />);
  expect(screen.getByLabelText("Tamaño").value).toBe("M");
  expect(screen.getByText("Precio: S/ 28")).toBeTruthy();
});

test("tiene las tres opciones con sus textos", () => {
  render(<Tamano />);
  const textos = screen.getAllByRole("option").map((o) => o.textContent);
  expect(textos).toEqual(["Personal", "Mediana", "Familiar"]);
});

test("al elegir Familiar el precio pasa a S/ 36", () => {
  render(<Tamano />);
  elegir("L");
  expect(screen.getByText("Precio: S/ 36")).toBeTruthy();
});

test("al elegir Personal el precio pasa a S/ 20", () => {
  render(<Tamano />);
  elegir("S");
  expect(screen.getByText("Precio: S/ 20")).toBeTruthy();
});

test("el select muestra el tamaño elegido", () => {
  render(<Tamano />);
  elegir("L");
  expect(screen.getByLabelText("Tamaño").value).toBe("L");
  elegir("M");
  expect(screen.getByLabelText("Tamaño").value).toBe("M");
  expect(screen.getByText("Precio: S/ 28")).toBeTruthy();
});
