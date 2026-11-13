// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { reducerCarrito, ProveedorCarrito, Menu, ResumenCarrito } from "./solucion.jsx";

const MARGARITA = { id: 1, nombre: "Margarita", precio: 28 };
const PEPPERONI = { id: 2, nombre: "Pepperoni", precio: 32 };

function renderCarrito() {
  render(
    <ProveedorCarrito>
      <Menu pizzas={[MARGARITA, PEPPERONI]} />
      <ResumenCarrito />
    </ProveedorCarrito>,
  );
}

function agregar(nombre, veces = 1) {
  for (let i = 0; i < veces; i++) fireEvent.click(screen.getByText(`Agregar ${nombre}`));
}

test("el reducer agrega con cantidad 1 y suma si ya existe, sin mutar", () => {
  const vacio = [];
  const uno = reducerCarrito(vacio, { tipo: "agregar", pizza: MARGARITA });
  expect(uno).toEqual([{ ...MARGARITA, cantidad: 1 }]);
  expect(vacio).toEqual([]);

  const dos = reducerCarrito(uno, { tipo: "agregar", pizza: MARGARITA });
  expect(dos).toEqual([{ ...MARGARITA, cantidad: 2 }]);
  expect(uno[0].cantidad).toBe(1);
  expect(dos).not.toBe(uno);
});

test("restar quita la pizza cuando su cantidad llega a 0", () => {
  const items = [
    { ...MARGARITA, cantidad: 2 },
    { ...PEPPERONI, cantidad: 1 },
  ];
  const resultado = reducerCarrito(items, { tipo: "restar", id: 2 });
  expect(resultado).toEqual([{ ...MARGARITA, cantidad: 2 }]);
  expect(reducerCarrito(resultado, { tipo: "restar", id: 1 })).toEqual([{ ...MARGARITA, cantidad: 1 }]);
  expect(items).toHaveLength(2);
});

test("vaciar devuelve [] y una acción desconocida lanza un error", () => {
  expect(reducerCarrito([{ ...MARGARITA, cantidad: 3 }], { tipo: "vaciar" })).toEqual([]);
  expect(() => reducerCarrito([], { tipo: "volar" })).toThrow();
});

test("muestra las unidades y el total calculados", () => {
  renderCarrito();
  expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
  agregar("Margarita", 2);
  agregar("Pepperoni");
  expect(screen.getByText("Margarita x2")).toBeTruthy();
  expect(screen.getByText("3 pizzas, total S/ 88")).toBeTruthy();
});

test("quitar una Pepperoni la saca del carrito si era la única", () => {
  renderCarrito();
  agregar("Margarita", 2);
  agregar("Pepperoni");
  fireEvent.click(screen.getByLabelText("Quitar una Pepperoni"));
  expect(screen.queryByText(/Pepperoni x/)).toBeNull();
  expect(screen.getByText("2 pizzas, total S/ 56")).toBeTruthy();
});

test('"Vaciar carrito" deja el mensaje de carrito vacío', () => {
  renderCarrito();
  agregar("Margarita");
  agregar("Pepperoni");
  fireEvent.click(screen.getByText("Vaciar carrito"));
  expect(screen.getByText("Tu carrito está vacío.")).toBeTruthy();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});
