// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TablaPedidos } from "./solucion.jsx";

const PEDIDOS = [
  { id: 1, cliente: "Rosa", total: 60 },
  { id: 2, cliente: "Ana", total: 90 },
  { id: 3, cliente: "Luis", total: 30 },
];

// Nombres de cliente de las filas del cuerpo (la primera fila es el encabezado).
function clientes() {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((fila) => fila.cells[0].textContent);
}

function clic(texto) {
  fireEvent.click(screen.getByText(texto));
}

test("al inicio ordena por cliente y muestra la primera página", () => {
  render(<TablaPedidos pedidos={PEDIDOS} />);
  expect(clientes()).toEqual(["Ana", "Luis"]);
  expect(screen.getByText("Página 1 de 2")).toBeTruthy();
  expect(screen.getByText("Anterior").disabled).toBe(true);
  expect(screen.getByText("Siguiente").disabled).toBe(false);
});

test("Siguiente y Anterior cambian de página", () => {
  render(<TablaPedidos pedidos={PEDIDOS} />);
  clic("Siguiente");
  expect(clientes()).toEqual(["Rosa"]);
  expect(screen.getByText("Página 2 de 2")).toBeTruthy();
  expect(screen.getByText("Siguiente").disabled).toBe(true);
  clic("Anterior");
  expect(clientes()).toEqual(["Ana", "Luis"]);
});

test("clic en Total ordena de menor a mayor y otro clic invierte", () => {
  render(<TablaPedidos pedidos={PEDIDOS} />);
  clic("Total");
  expect(clientes()).toEqual(["Luis", "Rosa"]);
  clic("Total");
  expect(clientes()).toEqual(["Ana", "Rosa"]);
  clic("Cliente");
  expect(clientes()).toEqual(["Ana", "Luis"]);
});

test("buscar filtra sin distinguir mayúsculas y vuelve a la página 1", () => {
  render(<TablaPedidos pedidos={PEDIDOS} />);
  clic("Siguiente");
  fireEvent.change(screen.getByLabelText("Buscar cliente"), { target: { value: " LU " } });
  expect(clientes()).toEqual(["Luis"]);
  expect(screen.getByText("Página 1 de 1")).toBeTruthy();
});

test("sin resultados la tabla queda vacía y dice Página 1 de 1", () => {
  render(<TablaPedidos pedidos={PEDIDOS} />);
  fireEvent.change(screen.getByLabelText("Buscar cliente"), { target: { value: "zzz" } });
  expect(clientes()).toEqual([]);
  expect(screen.getByText("Página 1 de 1")).toBeTruthy();
  expect(screen.getByText("Anterior").disabled).toBe(true);
  expect(screen.getByText("Siguiente").disabled).toBe(true);
});
