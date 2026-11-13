// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Menu } from "./solucion.jsx";

const PIZZAS = [
  { id: "m", nombre: "Margarita" },
  { id: "p", nombre: "Pepperoni" },
];

// Este test va primero a propósito: React avisa de la key faltante solo una vez
// por componente, en el primer render que la tenga.
test("cada <li> tiene su key (React no muestra advertencias)", () => {
  const erroresDeConsola = vi.spyOn(console, "error");
  render(<Menu pizzas={PIZZAS} />);
  const advertenciasDeKey = erroresDeConsola.mock.calls.filter((llamada) =>
    llamada.some((parte) => String(parte).includes("key"))
  );
  erroresDeConsola.mockRestore();
  expect(screen.getAllByRole("listitem").length).toBe(2);
  expect(advertenciasDeKey).toEqual([]);
});

test("pinta un <li> por cada pizza", () => {
  render(<Menu pizzas={PIZZAS} />);
  expect(screen.getAllByRole("listitem").length).toBe(2);
});

test("muestra los nombres en el mismo orden", () => {
  render(<Menu pizzas={[...PIZZAS, { id: "h", nombre: "Hawaiana" }]} />);
  const nombres = screen.getAllByRole("listitem").map((li) => li.textContent);
  expect(nombres).toEqual(["Margarita", "Pepperoni", "Hawaiana"]);
});

test("los <li> están dentro de una <ul>", () => {
  render(<Menu pizzas={PIZZAS} />);
  const lista = screen.getByRole("list");
  expect(lista.tagName).toBe("UL");
  expect(lista.children.length).toBe(2);
});

test("con un arreglo vacío no pinta ningún <li>", () => {
  render(<Menu pizzas={[]} />);
  expect(screen.queryAllByRole("listitem").length).toBe(0);
});
