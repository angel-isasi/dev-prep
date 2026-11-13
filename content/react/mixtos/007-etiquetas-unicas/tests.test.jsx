// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Etiquetas } from "./solucion.jsx";

function textosVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("muestra todas las etiquetas sin repetir y en orden", () => {
  render(<Etiquetas pizzas={[{ etiquetas: ["picante", "carne"] }, { etiquetas: ["veggie", "picante"] }]} />);
  expect(textosVisibles()).toEqual(["carne", "picante", "veggie"]);
});

test("ordena bien las palabras con tilde", () => {
  render(<Etiquetas pizzas={[{ etiquetas: ["zapallo", "ácida"] }, { etiquetas: ["dulce", "ácida"] }]} />);
  expect(textosVisibles()).toEqual(["ácida", "dulce", "zapallo"]);
});

test("una pizza sin etiquetas no rompe nada", () => {
  render(<Etiquetas pizzas={[{ etiquetas: [] }, { etiquetas: ["queso"] }]} />);
  expect(textosVisibles()).toEqual(["queso"]);
});

test("sin pizzas la lista queda vacía", () => {
  render(<Etiquetas pizzas={[]} />);
  expect(textosVisibles()).toEqual([]);
});
