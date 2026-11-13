// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Carrito } from "./solucion.jsx";

function crearInicial() {
  return [
    { id: 1, nombre: "Margarita" },
    { id: 2, nombre: "Hawaiana" },
  ];
}

function nombresVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent.replace("×", "").trim());
}

test("al inicio muestra todas las pizzas", () => {
  render(<Carrito inicial={crearInicial()} />);
  expect(nombresVisibles()).toEqual(["Margarita", "Hawaiana"]);
});

test("quitar Margarita deja solo a Hawaiana", () => {
  render(<Carrito inicial={crearInicial()} />);
  fireEvent.click(screen.getByLabelText("Quitar Margarita"));
  expect(screen.getAllByRole("listitem").length).toBe(1);
  expect(nombresVisibles()).toEqual(["Hawaiana"]);
});

test("se pueden quitar todas", () => {
  render(<Carrito inicial={crearInicial()} />);
  fireEvent.click(screen.getByLabelText("Quitar Hawaiana"));
  fireEvent.click(screen.getByLabelText("Quitar Margarita"));
  expect(screen.queryAllByRole("listitem").length).toBe(0);
});

test("no modifica el arreglo inicial que recibe", () => {
  const inicial = crearInicial();
  render(<Carrito inicial={inicial} />);
  fireEvent.click(screen.getByLabelText("Quitar Margarita"));
  expect(inicial.length).toBe(2);
  expect(inicial[0].nombre).toBe("Margarita");
});
