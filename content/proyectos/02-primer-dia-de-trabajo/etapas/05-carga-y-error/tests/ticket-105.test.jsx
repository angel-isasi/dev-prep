// @vitest-environment jsdom
// TICKET-105: el panel dice que no hay pedidos cuando se cae el internet.
import { beforeEach, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { failNextRequest, resetDatabase } from "../src/api.js";

beforeEach(() => {
  resetDatabase();
  // El código viejo dejaba el error en consola: aquí no ensuciamos la salida de los tests.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const pedidos = () => screen.getByRole("region", { name: "Pedidos" });

test('mientras carga muestra "Cargando pedidos..." y no dice que no hay pedidos', async () => {
  render(<App />);
  expect(within(pedidos()).getByText("Cargando pedidos...")).toBeTruthy();
  expect(within(pedidos()).queryByText("No hay pedidos por ahora")).toBeNull();

  expect(await screen.findByRole("article", { name: "Pedido #1041" })).toBeTruthy();
  expect(within(pedidos()).queryByText("Cargando pedidos...")).toBeNull();
});

test("si la API falla muestra una alerta con el mensaje y sin tarjetas", async () => {
  failNextRequest("getOrders");
  render(<App />);
  const alerta = await within(pedidos()).findByRole("alert");
  expect(alerta.textContent).toContain("No se pudieron cargar los pedidos.");
  expect(within(alerta).getByRole("button", { name: "Reintentar" })).toBeTruthy();
  expect(within(pedidos()).queryAllByRole("article")).toHaveLength(0);
  expect(within(pedidos()).queryByText("No hay pedidos por ahora")).toBeNull();
  expect(within(pedidos()).queryByText("Cargando pedidos...")).toBeNull();
});

test('"Reintentar" vuelve a pedir los pedidos y quita la alerta', async () => {
  const user = userEvent.setup();
  failNextRequest("getOrders");
  render(<App />);
  await within(pedidos()).findByRole("alert");

  await user.click(within(pedidos()).getByRole("button", { name: "Reintentar" }));
  expect(within(pedidos()).getByText("Cargando pedidos...")).toBeTruthy();
  expect(await screen.findByRole("article", { name: "Pedido #1041" })).toBeTruthy();
  expect(within(pedidos()).queryByRole("alert")).toBeNull();
  expect(within(pedidos()).getAllByRole("article")).toHaveLength(6);
});

test('"No hay pedidos por ahora" sale solo cuando el servidor responde una lista vacía', async () => {
  resetDatabase({ orders: [] });
  render(<App />);
  expect(within(pedidos()).queryByText("No hay pedidos por ahora")).toBeNull();
  expect(await within(pedidos()).findByText("No hay pedidos por ahora")).toBeTruthy();
  expect(within(pedidos()).queryByRole("alert")).toBeNull();
});

test("si fallan los pedidos, la carta igual se muestra", async () => {
  failNextRequest("getOrders");
  render(<App />);
  await within(pedidos()).findByRole("alert");
  const carta = screen.getByRole("region", { name: "Carta" });
  expect(await within(carta).findByText("Ceviche clásico")).toBeTruthy();
  expect(within(carta).queryByRole("alert")).toBeNull();
});

test("después de reintentar, avanzar un pedido sigue funcionando", async () => {
  const user = userEvent.setup();
  failNextRequest("getOrders");
  render(<App />);
  await user.click(await within(pedidos()).findByRole("button", { name: "Reintentar" }));

  const tarjeta = await screen.findByRole("article", { name: "Pedido #1042" });
  await user.click(within(tarjeta).getByRole("button", { name: "Enviar a cocina" }));
  expect(await within(tarjeta).findByText("En cocina")).toBeTruthy();
});
