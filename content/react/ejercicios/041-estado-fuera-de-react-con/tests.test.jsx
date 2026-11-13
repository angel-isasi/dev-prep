// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { crearAlmacen, almacen, Visor } from "./solucion.jsx";

test("leer devuelve el valor inicial y cambiar lo reemplaza", () => {
  const contador = crearAlmacen(5);
  expect(contador.leer()).toBe(5);
  contador.cambiar(6);
  expect(contador.leer()).toBe(6);
});

test("suscribir avisa en cada cambio y devuelve una función para salir", () => {
  const contador = crearAlmacen(0);
  const oyente = vi.fn();
  const salir = contador.suscribir(oyente);
  contador.cambiar(1);
  contador.cambiar(2);
  expect(oyente).toHaveBeenCalledTimes(2);
  salir();
  contador.cambiar(3);
  expect(oyente).toHaveBeenCalledTimes(2);
});

test("cada almacén es independiente", () => {
  const a = crearAlmacen(1);
  const b = crearAlmacen(100);
  a.cambiar(2);
  expect(b.leer()).toBe(100);
});

test("Visor muestra el valor actual del almacén", () => {
  act(() => almacen.cambiar(3));
  render(<Visor />);
  expect(screen.getByText("Pedidos hoy: 3")).toBeTruthy();
});

test("todos los Visor se actualizan cuando el almacén cambia", () => {
  act(() => almacen.cambiar(0));
  render(
    <>
      <Visor />
      <Visor />
    </>,
  );
  expect(screen.getAllByText("Pedidos hoy: 0").length).toBe(2);
  act(() => almacen.cambiar(12));
  expect(screen.getAllByText("Pedidos hoy: 12").length).toBe(2);
});
