// @vitest-environment jsdom
// TICKET-101: el total de los pedidos no suma bien.
import { beforeEach, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import App from "../src/App.jsx";
import { resetDatabase } from "../src/api.js";
import { calcOrderTotal } from "../src/utils/money.js";

beforeEach(() => resetDatabase());

test("calcOrderTotal multiplica el precio por la cantidad", () => {
  const items = [
    { dishId: 1, name: "Ceviche clásico", price: 38, quantity: 2 },
    { dishId: 7, name: "Chicha morada (jarra)", price: 18, quantity: 1 },
  ];
  expect(calcOrderTotal(items)).toBe(94);
});

test("calcOrderTotal funciona con precios con decimales", () => {
  expect(calcOrderTotal([{ dishId: 8, name: "Inca Kola 1 L", price: 9.5, quantity: 3 }])).toBe(28.5);
});

test("calcOrderTotal cuenta como 1 los items sin quantity (pedidos de delivery)", () => {
  const items = [
    { dishId: 4, name: "Arroz con mariscos", price: 45 },
    { dishId: 9, name: "Suspiro a la limeña", price: 15, quantity: 2 },
  ];
  expect(calcOrderTotal(items)).toBe(75);
});

test("calcOrderTotal de un pedido sin items es 0", () => {
  expect(calcOrderTotal([])).toBe(0);
});

test("las tarjetas muestran el total correcto de cada pedido", async () => {
  render(<App />);
  const esperados = { 1041: "Total: S/ 94.00", 1042: "Total: S/ 51.50", 1043: "Total: S/ 96.00", 1044: "Total: S/ 58.00" };
  for (const [id, total] of Object.entries(esperados)) {
    const tarjeta = await screen.findByRole("article", { name: `Pedido #${id}` });
    expect(within(tarjeta).getByText(total)).toBeTruthy();
  }
});
