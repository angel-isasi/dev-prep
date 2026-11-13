// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Nombre } from "./solucion.jsx";

function escribir(texto) {
  fireEvent.change(screen.getByLabelText("Tu nombre"), { target: { value: texto } });
}

test('al inicio dice "Escribe tu nombre"', () => {
  render(<Nombre />);
  expect(screen.getByText("Escribe tu nombre")).toBeTruthy();
});

test("muestra el nombre mientras escribes", () => {
  render(<Nombre />);
  escribir("Angel");
  expect(screen.getByText("Pedido a nombre de Angel")).toBeTruthy();
  expect(screen.queryByText("Escribe tu nombre")).toBeNull();
});

test("se actualiza con cada cambio", () => {
  render(<Nombre />);
  escribir("Ro");
  expect(screen.getByText("Pedido a nombre de Ro")).toBeTruthy();
  escribir("Rosa");
  expect(screen.getByText("Pedido a nombre de Rosa")).toBeTruthy();
});

test("el input muestra lo que hay en el estado", () => {
  render(<Nombre />);
  escribir("Angel");
  expect(screen.getByLabelText("Tu nombre").value).toBe("Angel");
});

test('si borras todo vuelve a "Escribe tu nombre"', () => {
  render(<Nombre />);
  escribir("Angel");
  escribir("");
  expect(screen.getByText("Escribe tu nombre")).toBeTruthy();
});
