// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Terminos } from "./solucion.jsx";

function casilla() {
  return screen.getByLabelText("Acepto los términos");
}

function boton() {
  return screen.getByRole("button", { name: "Confirmar pedido" });
}

test("al inicio la casilla está desmarcada y el botón deshabilitado", () => {
  render(<Terminos />);
  expect(casilla().checked).toBe(false);
  expect(boton().disabled).toBe(true);
});

test("al marcar la casilla el botón se habilita", () => {
  render(<Terminos />);
  fireEvent.click(casilla());
  expect(boton().disabled).toBe(false);
});

test("al desmarcarla el botón se vuelve a deshabilitar", () => {
  render(<Terminos />);
  fireEvent.click(casilla());
  fireEvent.click(casilla());
  expect(boton().disabled).toBe(true);
});

test("la casilla refleja si está marcada o no", () => {
  render(<Terminos />);
  fireEvent.click(casilla());
  expect(casilla().checked).toBe(true);
  fireEvent.click(casilla());
  expect(casilla().checked).toBe(false);
});
