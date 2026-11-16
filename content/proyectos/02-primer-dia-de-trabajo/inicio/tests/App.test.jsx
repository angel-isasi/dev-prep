// @vitest-environment jsdom
// Tests del equipo para la pantalla principal. Deben seguir pasando después de cada ticket.
import { beforeEach, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { resetDatabase } from "../src/api.js";

beforeEach(() => resetDatabase());

const pedidos = () => screen.getByRole("region", { name: "Pedidos" });

test("muestra el nombre de la app y del local", () => {
  render(<App />);
  const banner = screen.getByRole("banner");
  expect(within(banner).getByRole("heading", { level: 1, name: "MesaYa" })).toBeTruthy();
  expect(within(banner).getByText("Sabor Norteño · Miraflores")).toBeTruthy();
});

test("muestra una tarjeta por cada pedido que llega de la API", async () => {
  render(<App />);
  expect(await screen.findByRole("article", { name: "Pedido #1041" })).toBeTruthy();
  expect(within(pedidos()).getAllByRole("article")).toHaveLength(6);
  const tarjeta = screen.getByRole("article", { name: "Pedido #1043" });
  expect(within(tarjeta).getByText("Carlos Huamán")).toBeTruthy();
  expect(within(tarjeta).getByText("Pendiente")).toBeTruthy();
  expect(within(tarjeta).getByRole("button", { name: "Enviar a cocina" })).toBeTruthy();
});

test('"Ocultar entregados" esconde los pedidos ya entregados', async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("article", { name: "Pedido #1045" });

  await user.click(screen.getByRole("checkbox", { name: "Ocultar entregados" }));
  expect(screen.queryByRole("article", { name: "Pedido #1045" })).toBeNull();
  expect(within(pedidos()).getAllByRole("article")).toHaveLength(5);
});

test("los pedidos entregados no tienen botón para avanzar", async () => {
  render(<App />);
  const tarjeta = await screen.findByRole("article", { name: "Pedido #1045" });
  expect(within(tarjeta).queryByRole("button")).toBeNull();
});
