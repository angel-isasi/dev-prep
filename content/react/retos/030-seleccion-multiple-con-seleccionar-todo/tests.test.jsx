// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SeleccionMultiple } from "./solucion.jsx";

const ITEMS = [
  { id: 1, nombre: "Noticia A" },
  { id: 2, nombre: "Noticia B" },
];

const casilla = (texto) => screen.getByLabelText(texto);
const clic = (texto) => fireEvent.click(casilla(texto));

test("al inicio no hay nada seleccionado", () => {
  render(<SeleccionMultiple items={ITEMS} />);
  expect(screen.getByText("0 seleccionados")).toBeTruthy();
  expect(casilla("Seleccionar todo").checked).toBe(false);
  expect(casilla("Seleccionar todo").indeterminate).toBe(false);
});

test("marcar uno deja 'Seleccionar todo' en estado indeterminado", () => {
  render(<SeleccionMultiple items={ITEMS} />);
  clic("Noticia A");
  expect(casilla("Noticia A").checked).toBe(true);
  expect(screen.getByText("1 seleccionados")).toBeTruthy();
  expect(casilla("Seleccionar todo").checked).toBe(false);
  expect(casilla("Seleccionar todo").indeterminate).toBe(true);
});

test("'Seleccionar todo' marca todos", () => {
  render(<SeleccionMultiple items={ITEMS} />);
  clic("Noticia A");
  clic("Seleccionar todo");
  expect(screen.getByText("2 seleccionados")).toBeTruthy();
  expect(casilla("Noticia A").checked).toBe(true);
  expect(casilla("Noticia B").checked).toBe(true);
  expect(casilla("Seleccionar todo").checked).toBe(true);
  expect(casilla("Seleccionar todo").indeterminate).toBe(false);
});

test("con todos marcados, 'Seleccionar todo' los desmarca", () => {
  render(<SeleccionMultiple items={ITEMS} />);
  clic("Seleccionar todo");
  clic("Seleccionar todo");
  expect(screen.getByText("0 seleccionados")).toBeTruthy();
  expect(casilla("Noticia A").checked).toBe(false);
  expect(casilla("Noticia B").checked).toBe(false);
});

test("marcar todos uno por uno también marca 'Seleccionar todo'", () => {
  render(<SeleccionMultiple items={ITEMS} />);
  clic("Noticia A");
  clic("Noticia B");
  expect(casilla("Seleccionar todo").checked).toBe(true);
  expect(casilla("Seleccionar todo").indeterminate).toBe(false);
  clic("Noticia A");
  expect(casilla("Seleccionar todo").checked).toBe(false);
  expect(casilla("Seleccionar todo").indeterminate).toBe(true);
});
