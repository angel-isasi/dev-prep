// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { carritoReducer, Carrito } from "./solucion.jsx";

const margarita = { id: "m", nombre: "Margarita", precio: 28 };
const pepperoni = { id: "p", nombre: "Pepperoni", precio: 32 };

test("agregar suma cantidades y quitar elimina (probado con reduce, sin React)", () => {
  const acciones = [
    { tipo: "agregar", item: margarita },
    { tipo: "agregar", item: margarita },
    { tipo: "agregar", item: pepperoni },
    { tipo: "quitar", id: "p" },
  ];
  expect(acciones.reduce(carritoReducer, Object.freeze([]))).toEqual([{ ...margarita, cantidad: 2 }]);
});

test("no modifica el estado anterior (llega congelado)", () => {
  const item = Object.freeze({ ...margarita, cantidad: 1 });
  const anterior = Object.freeze([item]);
  const nuevo = carritoReducer(anterior, { tipo: "agregar", item: margarita });
  expect(nuevo).not.toBe(anterior);
  expect(nuevo[0].cantidad).toBe(2);
  expect(anterior[0].cantidad).toBe(1);
});

test("vaciar deja el carrito vacío", () => {
  const estado = Object.freeze([{ ...margarita, cantidad: 3 }]);
  expect(carritoReducer(estado, { tipo: "vaciar" })).toEqual([]);
});

test("una acción desconocida lanza un error", () => {
  expect(() => carritoReducer([], { tipo: "inventada" })).toThrow("Acción desconocida");
});

test("el componente agrega, quita y vacía con useReducer", () => {
  render(<Carrito productos={[margarita, pepperoni]} />);
  fireEvent.click(screen.getByText("Agregar Margarita"));
  fireEvent.click(screen.getByText("Agregar Margarita"));
  fireEvent.click(screen.getByText("Agregar Pepperoni"));
  expect(screen.getByText("Margarita x2")).toBeTruthy();
  expect(screen.getByText("Pepperoni x1")).toBeTruthy();

  fireEvent.click(screen.getByLabelText("Quitar Pepperoni"));
  expect(screen.queryByText("Pepperoni x1")).toBeNull();
  expect(screen.getAllByRole("listitem").length).toBe(1);

  fireEvent.click(screen.getByText("Vaciar"));
  expect(screen.queryAllByRole("listitem")).toEqual([]);
});
