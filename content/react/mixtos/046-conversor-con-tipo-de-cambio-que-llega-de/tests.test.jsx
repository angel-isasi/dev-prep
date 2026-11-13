// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConversorDolares } from "./solucion.jsx";

function escribir(valor) {
  fireEvent.change(screen.getByLabelText("Monto en soles"), { target: { value: valor } });
}

test("mientras espera la tasa muestra el mensaje de carga", async () => {
  render(<ConversorDolares obtenerTasa={async () => 4} />);
  expect(screen.getByText("Consultando el tipo de cambio…")).toBeTruthy();
  expect(screen.getByLabelText("Monto en soles").value).toBe("100");
  expect(await screen.findByText("Equivale a US$ 25.00")).toBeTruthy();
  expect(screen.queryByText("Consultando el tipo de cambio…")).toBeNull();
});

test("convierte el monto con 2 decimales al escribir", async () => {
  render(<ConversorDolares obtenerTasa={async () => 4} />);
  await screen.findByText("Equivale a US$ 25.00");
  escribir("10");
  expect(screen.getByText("Equivale a US$ 2.50")).toBeTruthy();
  escribir("1");
  expect(screen.getByText("Equivale a US$ 0.25")).toBeTruthy();
});

test("avisa si el monto está vacío, no es número o es negativo", async () => {
  render(<ConversorDolares obtenerTasa={async () => 4} />);
  await screen.findByText("Equivale a US$ 25.00");
  for (const valor of ["abc", "", "   ", "-5"]) {
    escribir(valor);
    expect(screen.getByText("Escribe un monto válido.")).toBeTruthy();
  }
});

test("si la API falla muestra un error accesible", async () => {
  const obtenerTasa = async () => {
    throw new Error("sin conexión");
  };
  render(<ConversorDolares obtenerTasa={obtenerTasa} />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toBe("No pudimos obtener el tipo de cambio.");
  expect(screen.queryByText(/Equivale/)).toBeNull();
});

test("pide la tasa una sola vez aunque el usuario escriba", async () => {
  const obtenerTasa = vi.fn(async () => 4);
  render(<ConversorDolares obtenerTasa={obtenerTasa} />);
  await screen.findByText("Equivale a US$ 25.00");
  escribir("8");
  escribir("80");
  expect(screen.getByText("Equivale a US$ 20.00")).toBeTruthy();
  expect(obtenerTasa).toHaveBeenCalledTimes(1);
});
