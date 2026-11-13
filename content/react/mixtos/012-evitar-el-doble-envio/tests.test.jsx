// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BotonPagar } from "./solucion.jsx";

// Crea una función pagar cuya promesa resolvemos (o rechazamos) cuando queramos.
function pagoControlado() {
  const control = {};
  control.pagar = vi.fn(
    () =>
      new Promise((resolver, rechazar) => {
        control.terminar = resolver;
        control.fallar = rechazar;
      })
  );
  return control;
}

test("dos clics seguidos llaman a pagar una sola vez", async () => {
  const pago = pagoControlado();
  render(<BotonPagar pagar={pago.pagar} />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(pago.pagar).toHaveBeenCalledTimes(1);
  await act(async () => pago.terminar());
});

test('mientras espera dice "Pagando…" y está deshabilitado', async () => {
  const pago = pagoControlado();
  render(<BotonPagar pagar={pago.pagar} />);
  fireEvent.click(screen.getByText("Pagar"));
  const boton = screen.getByRole("button");
  expect(boton.textContent).toBe("Pagando…");
  expect(boton.disabled).toBe(true);
  await act(async () => pago.terminar());
});

test('al terminar vuelve a "Pagar" y se puede pagar otra vez', async () => {
  const pago = pagoControlado();
  render(<BotonPagar pagar={pago.pagar} />);
  fireEvent.click(screen.getByRole("button"));
  await act(async () => pago.terminar());
  const boton = screen.getByRole("button");
  expect(boton.textContent).toBe("Pagar");
  expect(boton.disabled).toBe(false);
  fireEvent.click(boton);
  expect(pago.pagar).toHaveBeenCalledTimes(2);
  await act(async () => pago.terminar());
});

test("si el pago falla muestra el error y vuelve a habilitar el botón", async () => {
  const pago = pagoControlado();
  render(<BotonPagar pagar={pago.pagar} />);
  fireEvent.click(screen.getByRole("button"));
  await act(async () => pago.fallar(new Error("tarjeta rechazada")));
  expect(screen.getByRole("alert").textContent).toBe("No se pudo procesar el pago");
  expect(screen.getByRole("button").disabled).toBe(false);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.queryByRole("alert")).toBeNull();
  await act(async () => pago.terminar());
});
