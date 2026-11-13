// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Carrito, carritoReducer } from "./solucion.jsx";

const PIZZA = { id: 1, nombre: "Pizza", precio: 25 };
const GASEOSA = { id: 2, nombre: "Gaseosa", precio: 4.5 };
const PRODUCTOS = [PIZZA, GASEOSA];

const clic = (texto) => fireEvent.click(screen.getByText(texto));

test("el reducer agrega con cantidad 1 y suma si ya está, sin mutar el arreglo", () => {
  const vacio = [];
  const uno = carritoReducer(vacio, { tipo: "agregar", producto: PIZZA });
  expect(uno).toEqual([{ ...PIZZA, cantidad: 1 }]);
  expect(vacio).toEqual([]);

  const dos = carritoReducer(uno, { tipo: "agregar", producto: PIZZA });
  expect(dos).toEqual([{ ...PIZZA, cantidad: 2 }]);
  expect(uno[0].cantidad).toBe(1);
});

test("el reducer quita de a uno, saca el producto en 0 y vacía", () => {
  const carrito = [{ ...PIZZA, cantidad: 2 }, { ...GASEOSA, cantidad: 1 }];
  expect(carritoReducer(carrito, { tipo: "quitar", id: 1 })).toEqual([
    { ...PIZZA, cantidad: 1 },
    { ...GASEOSA, cantidad: 1 },
  ]);
  expect(carritoReducer(carrito, { tipo: "quitar", id: 2 })).toEqual([{ ...PIZZA, cantidad: 2 }]);
  expect(carritoReducer(carrito, { tipo: "vaciar" })).toEqual([]);
});

test("al inicio el carrito está vacío y el total es S/ 0.00", () => {
  render(<Carrito productos={PRODUCTOS} />);
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  expect(screen.getByText("Total: S/ 0.00")).toBeTruthy();
});

test("agregar dos veces el mismo producto suma la cantidad", () => {
  render(<Carrito productos={PRODUCTOS} />);
  clic("Agregar Pizza");
  clic("Agregar Pizza");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByText("Pizza × 2")).toBeTruthy();
  expect(screen.getByText("Total: S/ 50.00")).toBeTruthy();
});

test("el total se muestra con 2 decimales", () => {
  render(<Carrito productos={PRODUCTOS} />);
  clic("Agregar Pizza");
  clic("Agregar Pizza");
  clic("Agregar Gaseosa");
  expect(screen.getByText("Total: S/ 54.50")).toBeTruthy();
});

test("quitar un producto con cantidad 1 lo saca del carrito", () => {
  render(<Carrito productos={PRODUCTOS} />);
  clic("Agregar Pizza");
  clic("Agregar Gaseosa");
  fireEvent.click(screen.getByLabelText("Quitar Gaseosa"));
  expect(screen.queryByText(/Gaseosa ×/)).toBeNull();
  expect(screen.getByText("Total: S/ 25.00")).toBeTruthy();
});
