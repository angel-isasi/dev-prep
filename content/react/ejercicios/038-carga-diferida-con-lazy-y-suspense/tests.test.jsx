// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Locales, Mapa } from "./solucion.jsx";

// Ojo: el orden de estos tests importa. Un componente lazy se descarga
// una sola vez; después queda guardado en memoria.

test("al abrir la página el mapa no se carga", () => {
  render(<Locales />);
  expect(screen.getByText("Ver mapa")).toBeTruthy();
  expect(screen.queryByText("Cargando mapa…")).toBeNull();
  expect(screen.queryByText("Mapa de locales")).toBeNull();
});

test('al pedir el mapa muestra "Cargando mapa…" y luego el mapa', async () => {
  render(<Locales />);
  fireEvent.click(screen.getByText("Ver mapa"));
  expect(screen.getByText("Cargando mapa…")).toBeTruthy();
  expect(await screen.findByText("Mapa de locales")).toBeTruthy();
  expect(screen.queryByText("Cargando mapa…")).toBeNull();
});

test("una vez descargado, el mapa aparece al instante", () => {
  render(<Locales />);
  fireEvent.click(screen.getByText("Ver mapa"));
  expect(screen.getByText("Mapa de locales")).toBeTruthy();
});

test("Mapa es un componente creado con lazy", () => {
  expect(Mapa.$$typeof).toBe(Symbol.for("react.lazy"));
});
