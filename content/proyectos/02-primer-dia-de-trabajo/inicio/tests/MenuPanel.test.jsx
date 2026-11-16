// @vitest-environment jsdom
// Tests del equipo para la carta. Deben seguir pasando después de cada ticket.
import { beforeEach, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuPanel } from "../src/components/MenuPanel.jsx";
import { getMenu, resetDatabase } from "../src/api.js";

beforeEach(() => resetDatabase());

const carta = () => screen.getByRole("region", { name: "Carta" });

test("muestra los platos con su precio en soles", async () => {
  render(<MenuPanel />);
  expect(await screen.findByText("Ceviche clásico")).toBeTruthy();
  expect(within(carta()).getAllByRole("listitem")).toHaveLength(10);
  expect(within(carta()).getByText("S/ 9.50")).toBeTruthy();
});

test("el buscador filtra por nombre sin importar tildes", async () => {
  const user = userEvent.setup();
  render(<MenuPanel />);
  await screen.findByText("Ceviche clásico");

  await user.type(screen.getByRole("searchbox", { name: "Buscar platos" }), "aji");
  const items = within(carta()).getAllByRole("listitem");
  expect(items).toHaveLength(1);
  expect(within(items[0]).getByText("Ají de gallina")).toBeTruthy();
});

test("marcar un plato como agotado lo muestra al instante y lo guarda", async () => {
  const user = userEvent.setup();
  render(<MenuPanel />);
  await screen.findByText("Lomo saltado");

  await user.click(screen.getByRole("button", { name: "Marcar agotado: Lomo saltado" }));
  expect(await screen.findByRole("button", { name: "Marcar disponible: Lomo saltado" })).toBeTruthy();
  expect((await getMenu()).find((d) => d.name === "Lomo saltado").available).toBe(false);
});
