// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AlmacenCarrito, carrito, Insignia } from "./solucion.jsx";

test("un almacén nuevo empieza vacío y sus datos son privados", () => {
  const almacen = new AlmacenCarrito();
  expect(almacen.leer()).toEqual([]);
  expect(almacen.items).toBeUndefined();
  expect(almacen.oyentes).toBeUndefined();
});

test("agregar crea un arreglo nuevo y no toca el anterior", () => {
  const almacen = new AlmacenCarrito();
  const antes = almacen.leer();
  almacen.agregar("Margarita");
  expect(almacen.leer()).toEqual(["Margarita"]);
  expect(almacen.leer()).not.toBe(antes);
  expect(antes).toEqual([]);
});

test("leer devuelve la misma referencia si nada cambió", () => {
  const almacen = new AlmacenCarrito();
  almacen.agregar("Hawaiana");
  expect(almacen.leer()).toBe(almacen.leer());
});

test("suscribir avisa en cada cambio y su función de retorno corta los avisos", () => {
  const almacen = new AlmacenCarrito();
  const oyente = vi.fn();
  const { suscribir } = almacen; // suelta, como la recibe React
  const quitar = suscribir(oyente);
  almacen.agregar("Margarita");
  expect(oyente).toHaveBeenCalledTimes(1);
  quitar();
  almacen.agregar("Pepperoni");
  expect(oyente).toHaveBeenCalledTimes(1);
});

test("Insignia se actualiza cuando el almacén cambia", () => {
  const almacen = new AlmacenCarrito();
  render(<Insignia almacen={almacen} />);
  expect(screen.getByText("0 en el carrito")).toBeTruthy();
  act(() => almacen.agregar("Margarita"));
  act(() => almacen.agregar("Pepperoni"));
  expect(screen.getByText("2 en el carrito")).toBeTruthy();
});

test("sin prop, Insignia usa el carrito compartido", () => {
  render(<Insignia />);
  act(() => carrito.agregar("Margarita"));
  expect(screen.getByText("1 en el carrito")).toBeTruthy();
});
