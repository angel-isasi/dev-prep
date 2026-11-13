// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Contador } from "./solucion.jsx";

function clicks(texto, veces) {
  const boton = screen.getByText(texto);
  for (let i = 0; i < veces; i++) fireEvent.click(boton);
}

test('empieza en 0 y muestra "Valor: 0"', () => {
  render(<Contador />);
  expect(screen.getByText("Valor: 0")).toBeTruthy();
});

test("+ suma 1 y - resta 1", () => {
  render(<Contador />);
  clicks("+", 3);
  expect(screen.getByText("Valor: 3")).toBeTruthy();
  clicks("-", 1);
  expect(screen.getByText("Valor: 2")).toBeTruthy();
});

test("no baja de 0: el botón - empieza deshabilitado", () => {
  render(<Contador />);
  expect(screen.getByText("-").disabled).toBe(true);
  clicks("-", 2);
  expect(screen.getByText("Valor: 0")).toBeTruthy();
});

test("no pasa de max y deshabilita el botón +", () => {
  render(<Contador max={2} />);
  clicks("+", 3);
  expect(screen.getByText("Valor: 2")).toBeTruthy();
  expect(screen.getByText("+").disabled).toBe(true);
});

test("sin la prop max, el límite es 10", () => {
  render(<Contador />);
  clicks("+", 15);
  expect(screen.getByText("Valor: 10")).toBeTruthy();
});

test("Reiniciar vuelve a 0", () => {
  render(<Contador max={5} />);
  clicks("+", 4);
  fireEvent.click(screen.getByText("Reiniciar"));
  expect(screen.getByText("Valor: 0")).toBeTruthy();
});
