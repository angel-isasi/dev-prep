// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pedido } from "./solucion.jsx";

function textosVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("si no hay items muestra el mensaje de vacío", () => {
  render(<Pedido items={[]} />);
  expect(screen.getByText("Tu pedido está vacío. Agrega una pizza del menú.")).toBeTruthy();
});

test("si no hay items no pinta ninguna lista", () => {
  render(<Pedido items={[]} />);
  expect(screen.queryByRole("list")).toBeNull();
});

test("con items muestra un <li> por cada uno, en orden", () => {
  render(<Pedido items={["Margarita", "Pepperoni", "Hawaiana"]} />);
  expect(textosVisibles()).toEqual(["Margarita", "Pepperoni", "Hawaiana"]);
});

test("con un solo item también muestra la lista", () => {
  render(<Pedido items={["Margarita"]} />);
  expect(screen.getByRole("list")).toBeTruthy();
  expect(textosVisibles()).toEqual(["Margarita"]);
});

test("con items no aparece el mensaje de vacío", () => {
  render(<Pedido items={["Margarita"]} />);
  expect(screen.queryByText(/está vacío/)).toBeNull();
});
