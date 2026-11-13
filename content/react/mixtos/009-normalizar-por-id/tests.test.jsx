// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { porId, DetallePedido } from "./solucion.jsx";

const PIZZAS = [
  { id: "p1", nombre: "Margarita" },
  { id: "p2", nombre: "Pepperoni" },
];

function textosVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("porId indexa la lista por su id", () => {
  expect(porId(PIZZAS)).toEqual({ p1: PIZZAS[0], p2: PIZZAS[1] });
  expect(porId(PIZZAS).p2).toBe(PIZZAS[1]);
});

test("porId con lista vacía devuelve un objeto vacío", () => {
  expect(porId([])).toEqual({});
});

test("muestra los nombres en el orden del pedido", () => {
  render(<DetallePedido pedido={["p2", "p1"]} pizzas={PIZZAS} />);
  expect(textosVisibles()).toEqual(["Pepperoni", "Margarita"]);
});

test('si el id no existe muestra "Pizza no disponible"', () => {
  render(<DetallePedido pedido={["p2", "p9"]} pizzas={PIZZAS} />);
  expect(textosVisibles()).toEqual(["Pepperoni", "Pizza no disponible"]);
});
