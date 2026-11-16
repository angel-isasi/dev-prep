// @vitest-environment jsdom
// TICKET-102: mostrar si el pedido es de mesa, delivery o para llevar.
import { beforeEach, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { resetDatabase } from "../src/api.js";
import { initialOrders } from "../src/data/orders.js";

beforeEach(() => resetDatabase());

const pedidos = () => screen.getByRole("region", { name: "Pedidos" });
const tarjeta = (id) => screen.findByRole("article", { name: `Pedido #${id}` });

test('un pedido del salón muestra "Mesa" y su número', async () => {
  render(<App />);
  expect(within(await tarjeta(1041)).getByText("Mesa 4")).toBeTruthy();
  expect(within(await tarjeta(1044)).getByText("Mesa 2")).toBeTruthy();
});

test('un pedido de delivery muestra "Delivery"', async () => {
  render(<App />);
  expect(within(await tarjeta(1042)).getByText("Delivery")).toBeTruthy();
  expect(within(await tarjeta(1045)).getByText("Delivery")).toBeTruthy();
});

test('un pedido de recojo muestra "Para llevar"', async () => {
  render(<App />);
  expect(within(await tarjeta(1043)).getByText("Para llevar")).toBeTruthy();
});

test("usa el número de mesa de cada pedido, no uno fijo", async () => {
  resetDatabase({ orders: [{ ...initialOrders[0], id: 2001, table: 12 }] });
  render(<App />);
  expect(within(await tarjeta(2001)).getByText("Mesa 12")).toBeTruthy();
});

test('sin pedidos muestra "No hay pedidos por ahora" y ninguna tarjeta', async () => {
  resetDatabase({ orders: [] });
  render(<App />);
  expect(await within(pedidos()).findByText("No hay pedidos por ahora")).toBeTruthy();
  expect(within(pedidos()).queryAllByRole("article")).toHaveLength(0);
});

test('si "Ocultar entregados" esconde todos, también muestra el mensaje', async () => {
  const user = userEvent.setup();
  resetDatabase({ orders: initialOrders.filter((o) => o.status === "entregado") });
  render(<App />);
  await tarjeta(1045);

  await user.click(screen.getByRole("checkbox", { name: "Ocultar entregados" }));
  expect(within(pedidos()).getByText("No hay pedidos por ahora")).toBeTruthy();
});

test("la tarjeta conserva el resto de sus datos", async () => {
  render(<App />);
  const t = await tarjeta(1041);
  expect(within(t).getByText("José Quispe")).toBeTruthy();
  expect(within(t).getByText("En cocina")).toBeTruthy();
  expect(within(t).getByText("2 x Ceviche clásico")).toBeTruthy();
  expect(within(t).getByRole("button", { name: "Marcar como listo" })).toBeTruthy();
});
