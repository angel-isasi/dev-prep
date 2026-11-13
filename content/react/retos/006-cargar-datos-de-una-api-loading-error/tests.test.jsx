// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Noticias } from "./solucion.jsx";

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

function responder(datos, { ok = true, status = 200 } = {}) {
  globalThis.fetch = vi.fn(async () => ({ ok, status, json: async () => datos }));
}

test('muestra "Cargando..." mientras espera la respuesta', () => {
  globalThis.fetch = vi.fn(() => new Promise(() => {})); // nunca responde
  render(<Noticias />);
  expect(screen.getByText("Cargando...")).toBeTruthy();
});

test("pide /api/noticias una sola vez y muestra los títulos", async () => {
  responder([
    { id: 1, titulo: "Festival 2026" },
    { id: 2, titulo: "Nueva biblioteca" },
  ]);
  render(<Noticias />);
  expect(await screen.findByText("Festival 2026")).toBeTruthy();
  expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
    "Festival 2026",
    "Nueva biblioteca",
  ]);
  expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  expect(globalThis.fetch.mock.calls[0][0]).toBe("/api/noticias");
  expect(screen.queryByText("Cargando...")).toBeNull();
});

test('con un arreglo vacío muestra "No hay noticias"', async () => {
  responder([]);
  render(<Noticias />);
  expect(await screen.findByText("No hay noticias")).toBeTruthy();
});

test("con un error HTTP muestra una alerta con el status", async () => {
  responder(null, { ok: false, status: 500 });
  render(<Noticias />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("Error 500");
  expect(screen.queryByRole("listitem")).toBeNull();
});

test("si falla la red muestra una alerta con el mensaje", async () => {
  globalThis.fetch = vi.fn(async () => {
    throw new TypeError("Failed to fetch");
  });
  render(<Noticias />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("Failed to fetch");
});
