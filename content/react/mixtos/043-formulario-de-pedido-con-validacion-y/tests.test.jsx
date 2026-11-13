// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { validarPedido, FormularioPedido } from "./solucion.jsx";

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function enviar() {
  fireEvent.click(screen.getByText("Hacer pedido"));
}

test("validarPedido devuelve un mensaje por cada campo inválido", () => {
  expect(validarPedido({ nombre: " Al ", telefono: "123" })).toEqual({
    nombre: "Escribe tu nombre completo",
    telefono: "El celular debe tener 9 dígitos y empezar con 9",
  });
  expect(validarPedido({ nombre: "Angel", telefono: "887654321" })).toEqual({
    telefono: "El celular debe tener 9 dígitos y empezar con 9",
  });
  expect(validarPedido({ nombre: "Angel", telefono: "987 654 321" })).toEqual({});
});

test("al enviar vacío muestra 2 errores y marca los campos como inválidos", () => {
  render(<FormularioPedido />);
  enviar();
  expect(screen.getAllByRole("alert")).toHaveLength(2);
  expect(screen.getByLabelText("Nombre").getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByLabelText("Celular").getAttribute("aria-invalid")).toBe("true");
});

test("al corregir un campo y reenviar queda solo el otro error", () => {
  render(<FormularioPedido />);
  enviar();
  escribir("Nombre", "Angel Isasi");
  enviar();
  const alertas = screen.getAllByRole("alert");
  expect(alertas).toHaveLength(1);
  expect(alertas[0].textContent).toBe("El celular debe tener 9 dígitos y empezar con 9");
  expect(screen.getByLabelText("Nombre").getAttribute("aria-invalid")).toBe("false");
});

test("con datos válidos muestra el resumen del pedido", () => {
  render(<FormularioPedido />);
  escribir("Nombre", "  Angel Isasi ");
  escribir("Celular", "987654321");
  escribir("Tamaño", "L");
  enviar();
  expect(
    screen.getByText("Listo, Angel Isasi. Tu pizza L está en camino y te llamaremos al 987654321."),
  ).toBeTruthy();
  expect(screen.queryByText("Hacer pedido")).toBeNull();
});

test("el tamaño por defecto es M", () => {
  render(<FormularioPedido />);
  expect(screen.getByLabelText("Tamaño").value).toBe("M");
  escribir("Nombre", "Rosa");
  escribir("Celular", "912345678");
  enviar();
  expect(screen.getByText(/Tu pizza M está en camino/)).toBeTruthy();
});
