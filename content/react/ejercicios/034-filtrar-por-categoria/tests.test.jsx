// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuFiltrable } from "./solucion.jsx";

const PIZZAS = [
  { nombre: "Margarita", categoria: "clásicas" },
  { nombre: "Vegana", categoria: "veggie" },
  { nombre: "Americana", categoria: "clásicas" },
  { nombre: "Espinaca", categoria: "veggie" },
];

const visibles = () => screen.queryAllByRole("listitem").map((li) => li.textContent);
const botones = () => screen.getAllByRole("button").map((b) => b.textContent);

test('muestra "todas" y una categoría por botón, sin repetir y en orden', () => {
  render(<MenuFiltrable pizzas={PIZZAS} />);
  expect(botones()).toEqual(["todas", "clásicas", "veggie"]);
});

test("al inicio se ven todas las pizzas", () => {
  render(<MenuFiltrable pizzas={PIZZAS} />);
  expect(visibles()).toEqual(["Margarita", "Vegana", "Americana", "Espinaca"]);
});

test("al elegir una categoría solo se ven sus pizzas", () => {
  render(<MenuFiltrable pizzas={PIZZAS} />);
  fireEvent.click(screen.getByText("veggie"));
  expect(visibles()).toEqual(["Vegana", "Espinaca"]);
  fireEvent.click(screen.getByText("clásicas"));
  expect(visibles()).toEqual(["Margarita", "Americana"]);
});

test('"todas" vuelve a mostrar la carta completa', () => {
  render(<MenuFiltrable pizzas={PIZZAS} />);
  fireEvent.click(screen.getByText("veggie"));
  fireEvent.click(screen.getByText("todas"));
  expect(visibles()).toEqual(["Margarita", "Vegana", "Americana", "Espinaca"]);
});

test("solo el botón elegido tiene aria-pressed en true", () => {
  render(<MenuFiltrable pizzas={PIZZAS} />);
  expect(screen.getByText("todas").getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(screen.getByText("veggie"));
  expect(screen.getByText("veggie").getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText("todas").getAttribute("aria-pressed")).toBe("false");
  expect(screen.getByText("clásicas").getAttribute("aria-pressed")).toBe("false");
});
