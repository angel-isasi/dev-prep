// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, act, renderHook, waitFor } from "@testing-library/react";
import { PizzaDelDia, usePizzaDelDia } from "./solucion.jsx";

test("muestra el mensaje de carga mientras espera", () => {
  const obtener = () => new Promise(() => {}); // nunca responde
  render(<PizzaDelDia obtener={obtener} />);
  expect(screen.getByText("Cargando la pizza del día…")).toBeTruthy();
});

test('cuando llegan los datos muestra "Hoy: ..." en un h2', async () => {
  const obtener = async () => ({ nombre: "Cuatro quesos" });
  render(<PizzaDelDia obtener={obtener} />);
  const titulo = await screen.findByRole("heading", { level: 2 });
  expect(titulo.textContent).toBe("Hoy: Cuatro quesos");
  expect(screen.queryByText(/Cargando/)).toBeNull();
});

test("llama a obtener una sola vez al montar", async () => {
  const obtener = vi.fn(async () => ({ nombre: "Hawaiana" }));
  render(<PizzaDelDia obtener={obtener} />);
  await screen.findByText("Hoy: Hawaiana");
  expect(obtener).toHaveBeenCalledTimes(1);
});

test("el hook devuelve null y luego los datos", async () => {
  const pizza = { nombre: "Americana" };
  const { result } = renderHook(() => usePizzaDelDia(async () => pizza));
  expect(result.current).toBeNull();
  await waitFor(() => expect(result.current).toEqual(pizza));
});

test("una respuesta vieja no pisa a la nueva si obtener cambió", async () => {
  let resolverVieja;
  const obtenerVieja = () => new Promise((resolver) => (resolverVieja = resolver));
  const obtenerNueva = async () => ({ nombre: "Pepperoni" });

  const { rerender } = render(<PizzaDelDia obtener={obtenerVieja} />);
  rerender(<PizzaDelDia obtener={obtenerNueva} />);
  expect(await screen.findByText("Hoy: Pepperoni")).toBeTruthy();

  // La respuesta vieja llega tarde: debe ignorarse.
  await act(async () => resolverVieja({ nombre: "Margarita" }));
  expect(screen.getByText("Hoy: Pepperoni")).toBeTruthy();
  expect(screen.queryByText("Hoy: Margarita")).toBeNull();
});
