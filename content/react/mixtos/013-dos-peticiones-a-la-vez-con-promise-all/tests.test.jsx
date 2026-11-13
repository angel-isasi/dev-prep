// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Panel } from "./solucion.jsx";

test("muestra Cargando… y luego el resumen", async () => {
  render(<Panel obtenerMenu={async () => ["a", "b", "c"]} obtenerPromos={async () => ["2x1"]} />);
  expect(screen.getByText("Cargando…")).toBeTruthy();
  expect(await screen.findByText("3 pizzas y 1 promos")).toBeTruthy();
});

test("lanza las dos peticiones a la vez, sin esperar a la primera", async () => {
  let terminarMenu;
  const obtenerMenu = vi.fn(() => new Promise((resolver) => (terminarMenu = resolver)));
  const obtenerPromos = vi.fn(async () => ["2x1", "postre gratis"]);
  render(<Panel obtenerMenu={obtenerMenu} obtenerPromos={obtenerPromos} />);

  // El menú todavía no llegó, pero las promos ya se pidieron.
  expect(obtenerMenu).toHaveBeenCalledTimes(1);
  expect(obtenerPromos).toHaveBeenCalledTimes(1);

  await act(async () => terminarMenu(["a"]));
  expect(screen.getByText("1 pizzas y 2 promos")).toBeTruthy();
});

test("si una de las dos falla, muestra el error", async () => {
  render(
    <Panel
      obtenerMenu={async () => ["a"]}
      obtenerPromos={async () => {
        throw new Error("sin red");
      }}
    />
  );
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toBe("No se pudo cargar el panel");
  expect(screen.queryByText("Cargando…")).toBeNull();
});
