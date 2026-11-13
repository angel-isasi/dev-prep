// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pedido } from "./solucion.jsx";

function agregar(nombre) {
  fireEvent.click(screen.getByText(`Agregar ${nombre}`));
}

test("muestra un botón por cada pizza del menú", () => {
  render(<Pedido />);
  const textos = screen.getAllByRole("button").map((b) => b.textContent);
  expect(textos).toEqual(["Agregar Margarita", "Agregar Pepperoni"]);
});

test("al inicio el pedido está en cero", () => {
  render(<Pedido />);
  expect(screen.getByText("0 pizzas, total S/ 0")).toBeTruthy();
});

test("con una pizza usa el singular", () => {
  render(<Pedido />);
  agregar("Margarita");
  expect(screen.getByText("1 pizza, total S/ 28")).toBeTruthy();
});

test("suma pizzas distintas", () => {
  render(<Pedido />);
  agregar("Margarita");
  agregar("Pepperoni");
  expect(screen.getByText("2 pizzas, total S/ 60")).toBeTruthy();
});

test("se puede agregar la misma pizza varias veces", () => {
  render(<Pedido />);
  agregar("Margarita");
  agregar("Margarita");
  expect(screen.getByText("2 pizzas, total S/ 56")).toBeTruthy();
  agregar("Pepperoni");
  expect(screen.getByText("3 pizzas, total S/ 88")).toBeTruthy();
});
