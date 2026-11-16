// @vitest-environment jsdom
// TICKET-104: buscador de pedidos para la hora punta.
import { beforeEach, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { resetDatabase } from "../src/api.js";

beforeEach(() => resetDatabase());

const pedidos = () => screen.getByRole("region", { name: "Pedidos" });
const tarjetas = () => within(pedidos()).queryAllByRole("article").map((a) => a.getAttribute("aria-label"));
const buscador = () => within(pedidos()).getByRole("searchbox", { name: "Buscar pedidos" });

async function abrirApp() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("article", { name: "Pedido #1041" });
  return user;
}

test('la sección Pedidos tiene un buscador llamado "Buscar pedidos"', async () => {
  await abrirApp();
  expect(buscador()).toBeTruthy();
  expect(tarjetas()).toHaveLength(6);
});

test("busca por cliente sin importar tildes ni mayúsculas", async () => {
  const user = await abrirApp();
  await user.type(buscador(), "JOSE");
  expect(tarjetas()).toEqual(["Pedido #1041"]);
});

test("busca por número de pedido", async () => {
  const user = await abrirApp();
  await user.type(buscador(), "1043");
  expect(tarjetas()).toEqual(["Pedido #1043"]);
});

test('si nada coincide muestra "No hay pedidos que coincidan"', async () => {
  const user = await abrirApp();
  await user.type(buscador(), "Gastón");
  expect(tarjetas()).toHaveLength(0);
  expect(within(pedidos()).getByText("No hay pedidos que coincidan")).toBeTruthy();
  expect(within(pedidos()).queryByText("No hay pedidos por ahora")).toBeNull();
});

test('"Limpiar búsqueda" vacía el campo y vuelven todos los pedidos', async () => {
  const user = await abrirApp();
  await user.type(buscador(), "lucia");
  expect(tarjetas()).toEqual(["Pedido #1044", "Pedido #1046"]);

  await user.click(within(pedidos()).getByRole("button", { name: "Limpiar búsqueda" }));
  expect(buscador().value).toBe("");
  expect(tarjetas()).toHaveLength(6);
});

test('busca solo entre los visibles cuando "Ocultar entregados" está marcado', async () => {
  const user = await abrirApp();
  await user.type(buscador(), "andres");
  expect(tarjetas()).toEqual(["Pedido #1045"]);

  await user.click(screen.getByRole("checkbox", { name: "Ocultar entregados" }));
  expect(tarjetas()).toHaveLength(0);
  expect(within(pedidos()).getByText("No hay pedidos que coincidan")).toBeTruthy();
});

test("los contadores de la cabecera siguen contando todos los pedidos", async () => {
  const user = await abrirApp();
  await user.type(buscador(), "1043");
  const banner = screen.getByRole("banner");
  expect(within(banner).getByText("Pendientes: 3")).toBeTruthy();
  expect(within(banner).getByText("En cocina: 1")).toBeTruthy();
});

test("el buscador de la carta es independiente del de pedidos", async () => {
  const user = await abrirApp();
  const carta = screen.getByRole("region", { name: "Carta" });
  await within(carta).findByText("Lomo saltado");

  await user.type(buscador(), "1043");
  expect(within(carta).getAllByRole("listitem")).toHaveLength(10);
  expect(within(carta).getByRole("searchbox", { name: "Buscar platos" }).value).toBe("");
});
