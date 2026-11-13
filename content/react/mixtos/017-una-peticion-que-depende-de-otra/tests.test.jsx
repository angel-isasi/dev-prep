// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MisPedidos } from "./solucion.jsx";

test("muestra Cargando… y luego el resumen", async () => {
  const api = { usuario: async () => ({ id: 7, nombre: "Angel" }), pedidosDe: async () => [1, 2] };
  render(<MisPedidos api={api} />);
  expect(screen.getByText("Cargando…")).toBeTruthy();
  expect(await screen.findByText("Angel tiene 2 pedidos")).toBeTruthy();
});

test("pide los pedidos con el id del usuario", async () => {
  const api = { usuario: async () => ({ id: 7, nombre: "Angel" }), pedidosDe: vi.fn(async () => [1, 2, 3]) };
  render(<MisPedidos api={api} />);
  expect(await screen.findByText("Angel tiene 3 pedidos")).toBeTruthy();
  expect(api.pedidosDe).toHaveBeenCalledWith(7);
});

test("si falla el usuario, muestra el error y no pide los pedidos", async () => {
  const api = {
    usuario: async () => {
      throw new Error("sin sesión");
    },
    pedidosDe: vi.fn(async () => []),
  };
  render(<MisPedidos api={api} />);
  expect(await screen.findByText("No pudimos cargar tus pedidos")).toBeTruthy();
  expect(api.pedidosDe).not.toHaveBeenCalled();
});

test("si fallan los pedidos, también muestra el error", async () => {
  const api = {
    usuario: async () => ({ id: 7, nombre: "Angel" }),
    pedidosDe: async () => {
      throw new Error("servidor caído");
    },
  };
  render(<MisPedidos api={api} />);
  expect(await screen.findByText("No pudimos cargar tus pedidos")).toBeTruthy();
});
