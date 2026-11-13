// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { cambiarDistrito, PerfilCliente } from "./solucion.jsx";

function crearCliente() {
  return Object.freeze({
    nombre: "Ana",
    direccion: Object.freeze({ distrito: "Ica", calle: "Av. Los Maestros" }),
    pedidos: Object.freeze([1, 2]),
  });
}

test("cambia el distrito y conserva el resto de la dirección", () => {
  const nuevo = cambiarDistrito(crearCliente(), "Parcona");
  expect(nuevo.direccion).toEqual({ distrito: "Parcona", calle: "Av. Los Maestros" });
  expect(nuevo.nombre).toBe("Ana");
});

test("no modifica el cliente original (llega congelado)", () => {
  const cliente = crearCliente();
  cambiarDistrito(cliente, "Parcona");
  expect(cliente.direccion.distrito).toBe("Ica");
});

test("copia solo el camino que cambia y comparte lo demás", () => {
  const cliente = crearCliente();
  const nuevo = cambiarDistrito(cliente, "Parcona");
  expect(nuevo).not.toBe(cliente);
  expect(nuevo.direccion).not.toBe(cliente.direccion);
  expect(nuevo.pedidos).toBe(cliente.pedidos);
});

test("el componente actualiza el distrito al escribir", () => {
  const cliente = crearCliente();
  render(<PerfilCliente clienteInicial={cliente} />);
  expect(screen.getByText("Ana vive en Ica")).toBeTruthy();

  fireEvent.change(screen.getByLabelText("Distrito"), { target: { value: "Parcona" } });
  expect(screen.getByText("Ana vive en Parcona")).toBeTruthy();
  expect(screen.getByLabelText("Distrito").value).toBe("Parcona");
  expect(cliente.direccion.distrito).toBe("Ica");
});
