// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { agrupar, MenuPorCategoria } from "./solucion.jsx";

const PIZZAS = [
  { nombre: "Margarita", categoria: "Clásicas" },
  { nombre: "Vegana", categoria: "Veggie" },
  { nombre: "Pepperoni", categoria: "Clásicas" },
];

test("agrupar junta los elementos por el valor de la clave", () => {
  expect(agrupar(PIZZAS, "categoria")).toEqual({
    Clásicas: [PIZZAS[0], PIZZAS[2]],
    Veggie: [PIZZAS[1]],
  });
});

test("agrupar no modifica la lista original", () => {
  const lista = Object.freeze([...PIZZAS]);
  agrupar(lista, "categoria");
  expect(lista).toEqual(PIZZAS);
});

test("muestra un título por categoría, en orden de aparición", () => {
  render(<MenuPorCategoria pizzas={PIZZAS} />);
  expect(screen.getAllByRole("heading").map((h) => h.textContent)).toEqual(["Clásicas", "Veggie"]);
});

test("cada sección tiene sus pizzas", () => {
  render(<MenuPorCategoria pizzas={PIZZAS} />);
  const clasicas = screen.getByLabelText("Clásicas");
  expect([...clasicas.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["Margarita", "Pepperoni"]);
  expect(screen.getByLabelText("Veggie").querySelectorAll("li").length).toBe(1);
});

test("sin pizzas no pinta ninguna sección", () => {
  render(<MenuPorCategoria pizzas={[]} />);
  expect(screen.queryAllByRole("heading")).toEqual([]);
});
