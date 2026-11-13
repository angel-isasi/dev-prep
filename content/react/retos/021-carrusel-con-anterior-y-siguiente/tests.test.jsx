// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Carrusel } from "./solucion.jsx";

const SLIDES = ["Uno", "Dos", "Tres"];

const siguiente = () => fireEvent.click(screen.getByLabelText("Siguiente"));
const anterior = () => fireEvent.click(screen.getByLabelText("Anterior"));

test("al inicio muestra el primer slide y 1 / 3", () => {
  render(<Carrusel slides={SLIDES} />);
  expect(screen.getByText("Uno")).toBeTruthy();
  expect(screen.getByText("1 / 3")).toBeTruthy();
});

test("solo se ve un slide a la vez", () => {
  render(<Carrusel slides={SLIDES} />);
  expect(screen.queryByText("Dos")).toBeNull();
  expect(screen.queryByText("Tres")).toBeNull();
});

test('"Siguiente" avanza al siguiente slide', () => {
  render(<Carrusel slides={SLIDES} />);
  siguiente();
  expect(screen.getByText("Dos")).toBeTruthy();
  expect(screen.getByText("2 / 3")).toBeTruthy();
  expect(screen.queryByText("Uno")).toBeNull();
});

test('"Anterior" desde el primero va al último', () => {
  render(<Carrusel slides={SLIDES} />);
  anterior();
  expect(screen.getByText("Tres")).toBeTruthy();
  expect(screen.getByText("3 / 3")).toBeTruthy();
});

test('"Siguiente" desde el último vuelve al primero', () => {
  render(<Carrusel slides={SLIDES} />);
  siguiente();
  siguiente();
  siguiente();
  expect(screen.getByText("Uno")).toBeTruthy();
  expect(screen.getByText("1 / 3")).toBeTruthy();
});

test("se puede ir y volver combinando los botones", () => {
  render(<Carrusel slides={SLIDES} />);
  anterior();
  siguiente();
  siguiente();
  expect(screen.getByText("Dos")).toBeTruthy();
  expect(screen.getByText("2 / 3")).toBeTruthy();
});
