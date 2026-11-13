// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { EstadoPedido } from "./solucion.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

async function avanzar(ms) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

test('empieza en "preparando" y no consulta al montar', () => {
  const consultar = vi.fn(async () => "en camino");
  render(<EstadoPedido consultar={consultar} />);
  expect(screen.getByText("Tu pedido está: preparando")).toBeTruthy();
  expect(consultar).not.toHaveBeenCalled();
});

test("cada segundo consulta y muestra el estado nuevo", async () => {
  const consultar = vi.fn().mockResolvedValueOnce("en camino").mockResolvedValue("en tu puerta");
  render(<EstadoPedido consultar={consultar} />);
  await avanzar(1000);
  expect(screen.getByText("Tu pedido está: en camino")).toBeTruthy();
  await avanzar(1000);
  expect(screen.getByText("Tu pedido está: en tu puerta")).toBeTruthy();
});

test('deja de consultar cuando llega a "entregado"', async () => {
  const consultar = vi.fn().mockResolvedValueOnce("en camino").mockResolvedValue("entregado");
  render(<EstadoPedido consultar={consultar} />);
  await avanzar(1000);
  await avanzar(1000);
  expect(screen.getByText("Tu pedido está: entregado")).toBeTruthy();
  await avanzar(5000);
  expect(consultar).toHaveBeenCalledTimes(2);
  expect(vi.getTimerCount()).toBe(0);
});

test("respeta el intervalo indicado en `cada`", async () => {
  const consultar = vi.fn(async () => "en camino");
  render(<EstadoPedido consultar={consultar} cada={500} />);
  await avanzar(500);
  expect(consultar).toHaveBeenCalledTimes(1);
});

test("si una consulta falla, sigue consultando", async () => {
  const consultar = vi.fn().mockRejectedValueOnce(new Error("sin red")).mockResolvedValue("en camino");
  render(<EstadoPedido consultar={consultar} />);
  await avanzar(1000);
  expect(screen.getByText("Tu pedido está: preparando")).toBeTruthy();
  await avanzar(1000);
  expect(screen.getByText("Tu pedido está: en camino")).toBeTruthy();
});

test("al desmontar no deja intervalos vivos", () => {
  const { unmount } = render(<EstadoPedido consultar={async () => "en camino"} />);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
