// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PrecioRemoto } from "./solucion.jsx";

const PRECIOS = { M: 28, L: 36 };

// Una función obtenerPrecio cuyas promesas resolvemos a mano, cuando queramos.
function crearObtenerControlado() {
  const responder = {};
  const obtener = vi.fn(
    (tamano) =>
      new Promise((resolver) => {
        responder[tamano] = resolver;
      })
  );
  return { obtener, responder };
}

test('mientras espera muestra "Calculando"', () => {
  const { obtener } = crearObtenerControlado();
  render(<PrecioRemoto tamano="M" obtenerPrecio={obtener} />);
  expect(screen.getByText(/^Calculando/)).toBeTruthy();
});

test("muestra el precio cuando llega", async () => {
  const obtener = async (t) => PRECIOS[t];
  render(<PrecioRemoto tamano="M" obtenerPrecio={obtener} />);
  expect(await screen.findByText("S/ 28")).toBeTruthy();
});

test("vuelve a pedir el precio cuando cambia el tamaño", async () => {
  const obtener = async (t) => PRECIOS[t];
  const { rerender } = render(<PrecioRemoto tamano="M" obtenerPrecio={obtener} />);
  expect(await screen.findByText("S/ 28")).toBeTruthy();
  rerender(<PrecioRemoto tamano="L" obtenerPrecio={obtener} />);
  expect(await screen.findByText("S/ 36")).toBeTruthy();
});

test("llama a obtenerPrecio con el tamaño de la prop", () => {
  const { obtener } = crearObtenerControlado();
  const { rerender } = render(<PrecioRemoto tamano="M" obtenerPrecio={obtener} />);
  expect(obtener).toHaveBeenLastCalledWith("M");
  rerender(<PrecioRemoto tamano="L" obtenerPrecio={obtener} />);
  expect(obtener).toHaveBeenLastCalledWith("L");
});

test("una respuesta vieja que llega tarde no pisa a la nueva", async () => {
  const { obtener, responder } = crearObtenerControlado();
  const { rerender } = render(<PrecioRemoto tamano="M" obtenerPrecio={obtener} />);
  rerender(<PrecioRemoto tamano="L" obtenerPrecio={obtener} />);

  // Primero responde L, después (tarde) responde M.
  await act(async () => {
    responder.L(36);
  });
  await act(async () => {
    responder.M(28);
  });

  expect(screen.getByText("S/ 36")).toBeTruthy();
  expect(screen.queryByText("S/ 28")).toBeNull();
});
