// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Disponibles } from "./solucion.jsx";

function nombresVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

const PIZZAS = [
  { nombre: "Trufa", precio: 45, disponible: true },
  { nombre: "Agotada", precio: 10, disponible: false },
  { nombre: "Margarita", precio: 28, disponible: true },
];

test("muestra solo las disponibles, de la más barata a la más cara", () => {
  render(<Disponibles pizzas={PIZZAS} />);
  expect(nombresVisibles()).toEqual(["Margarita", "Trufa"]);
});

test("no modifica la prop (llega congelada)", () => {
  const congeladas = Object.freeze(PIZZAS.filter((p) => p.disponible));
  render(<Disponibles pizzas={congeladas} />);
  expect(nombresVisibles()).toEqual(["Margarita", "Trufa"]);
  expect(congeladas.map((p) => p.nombre)).toEqual(["Trufa", "Margarita"]);
});

test("con el mismo precio conserva el orden original", () => {
  render(
    <Disponibles
      pizzas={[
        { nombre: "Hawaiana", precio: 30, disponible: true },
        { nombre: "Americana", precio: 25, disponible: true },
        { nombre: "Napolitana", precio: 30, disponible: true },
      ]}
    />
  );
  expect(nombresVisibles()).toEqual(["Americana", "Hawaiana", "Napolitana"]);
});

test("si ninguna está disponible, la lista queda vacía", () => {
  render(<Disponibles pizzas={[{ nombre: "Agotada", precio: 10, disponible: false }]} />);
  expect(nombresVisibles()).toEqual([]);
});
