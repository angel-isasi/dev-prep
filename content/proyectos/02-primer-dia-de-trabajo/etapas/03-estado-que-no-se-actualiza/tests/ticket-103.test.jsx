// @vitest-environment jsdom
// TICKET-103: el pedido no cambia de estado al hacer clic.
import { beforeEach, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { getOrders, resetDatabase } from "../src/api.js";

// Guardamos lo que la API le entrega a la app, para comprobar después que nadie lo mutó.
const entregados = vi.hoisted(() => []);
vi.mock("../src/api.js", async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    getOrders: async () => {
      const orders = await real.getOrders();
      entregados.push(orders);
      return orders;
    },
  };
});

beforeEach(() => {
  resetDatabase();
  entregados.length = 0;
});

async function abrirApp() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("article", { name: "Pedido #1042" });
  return user;
}

const tarjeta = (id) => screen.getByRole("article", { name: `Pedido #${id}` });
const pedidos = () => screen.getByRole("region", { name: "Pedidos" });

test("al enviar a cocina, la tarjeta muestra el estado nuevo sin hacer nada más", async () => {
  const user = await abrirApp();
  await user.click(within(tarjeta(1042)).getByRole("button", { name: "Enviar a cocina" }));

  expect(await within(tarjeta(1042)).findByText("En cocina")).toBeTruthy();
  expect(within(tarjeta(1042)).queryByText("Pendiente")).toBeNull();
});

test("el botón de la tarjeta pasa a la siguiente acción", async () => {
  const user = await abrirApp();
  await user.click(within(tarjeta(1042)).getByRole("button", { name: "Enviar a cocina" }));
  expect(await within(tarjeta(1042)).findByRole("button", { name: "Marcar como listo" })).toBeTruthy();

  await user.click(within(tarjeta(1042)).getByRole("button", { name: "Marcar como listo" }));
  expect(await within(tarjeta(1042)).findByText("Listo")).toBeTruthy();
});

test("los contadores de la cabecera se actualizan al mismo tiempo", async () => {
  const user = await abrirApp();
  const banner = screen.getByRole("banner");
  expect(within(banner).getByText("Pendientes: 3")).toBeTruthy();

  await user.click(within(tarjeta(1042)).getByRole("button", { name: "Enviar a cocina" }));
  expect(await within(banner).findByText("Pendientes: 2")).toBeTruthy();
  expect(within(banner).getByText("En cocina: 2")).toBeTruthy();
});

test('con "Ocultar entregados" marcado, un pedido entregado desaparece al instante', async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("checkbox", { name: "Ocultar entregados" }));
  expect(within(pedidos()).getAllByRole("article")).toHaveLength(5);

  await user.click(within(tarjeta(1044)).getByRole("button", { name: "Marcar como entregado" }));
  await vi.waitFor(() => expect(screen.queryByRole("article", { name: "Pedido #1044" })).toBeNull());
  expect(within(pedidos()).getAllByRole("article")).toHaveLength(4);
});

test("el cambio se guarda en la API y los demás pedidos no cambian", async () => {
  const user = await abrirApp();
  await user.click(within(tarjeta(1042)).getByRole("button", { name: "Enviar a cocina" }));
  await within(tarjeta(1042)).findByText("En cocina");

  const servidor = await getOrders();
  expect(servidor.find((o) => o.id === 1042).status).toBe("en_cocina");
  expect(within(tarjeta(1043)).getByText("Pendiente")).toBeTruthy();
  expect(within(tarjeta(1046)).getByText("Pendiente")).toBeTruthy();
});

test("no muta los pedidos que están en el estado", async () => {
  const user = await abrirApp();
  await user.click(within(tarjeta(1042)).getByRole("button", { name: "Enviar a cocina" }));
  await new Promise((r) => setTimeout(r, 100)); // espera a que termine la llamada a la API

  // Lo que la API entregó al cargar debe seguir intacto: el estado nuevo va en objetos nuevos.
  expect(entregados[0].find((o) => o.id === 1042).status).toBe("pendiente");
});
