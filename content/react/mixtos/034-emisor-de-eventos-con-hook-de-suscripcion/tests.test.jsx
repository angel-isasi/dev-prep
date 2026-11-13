// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { bus, Avisos } from "./solucion.jsx";

test("on registra un oyente y emit le pasa el dato", () => {
  const recibidos = [];
  const quitar = bus.on("prueba", (dato) => recibidos.push(dato));
  bus.emit("prueba", 1);
  bus.emit("prueba", 2);
  expect(recibidos).toEqual([1, 2]);
  quitar();
});

test("la función que devuelve on quita al oyente", () => {
  const oyente = vi.fn();
  const quitar = bus.on("saludo", oyente);
  quitar();
  bus.emit("saludo", "hola");
  expect(oyente).not.toHaveBeenCalled();
  expect(bus.oyentes.saludo.size).toBe(0);
});

test('Avisos empieza mostrando "Último pedido: ninguno"', () => {
  render(<Avisos />);
  expect(screen.getByText("Último pedido: ninguno")).toBeTruthy();
});

test("Avisos muestra el último pedido emitido", () => {
  render(<Avisos />);
  act(() => bus.emit("pedido", "Margarita"));
  act(() => bus.emit("pedido", "Hawaiana"));
  expect(screen.getByText("Último pedido: Hawaiana")).toBeTruthy();
});

test("un evento distinto no cambia lo que muestra Avisos", () => {
  render(<Avisos />);
  act(() => bus.emit("reclamo", "Pizza fría"));
  expect(screen.getByText("Último pedido: ninguno")).toBeTruthy();
});

test("al desmontar Avisos, su oyente se quita del bus", () => {
  const { unmount } = render(<Avisos />);
  expect(bus.oyentes.pedido.size).toBe(1);
  unmount();
  expect(bus.oyentes.pedido.size).toBe(0);
});
