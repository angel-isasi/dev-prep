import { test, expect } from "vitest";
import { crearCarrito } from "./solucion.js";

test("empieza vacío", () => {
  const carrito = crearCarrito();
  expect(carrito.productos).toEqual([]);
  expect(carrito.total()).toBe(0);
  expect(carrito.cantidad()).toBe(0);
});

test("agregar guarda cada producto como objeto", () => {
  const carrito = crearCarrito();
  carrito.agregar("Pan", 0.5);
  carrito.agregar("Leche", 4.5);
  expect(carrito.productos).toEqual([
    { nombre: "Pan", precio: 0.5 },
    { nombre: "Leche", precio: 4.5 },
  ]);
});

test("total suma los precios y cantidad cuenta los productos", () => {
  const carrito = crearCarrito();
  carrito.agregar("Arroz", 3.5);
  carrito.agregar("Azúcar", 2);
  carrito.agregar("Aceite", 8.5);
  expect(carrito.total()).toBe(14);
  expect(carrito.cantidad()).toBe(3);
});

test("agregar devuelve el carrito para poder encadenar", () => {
  const carrito = crearCarrito();
  const resultado = carrito.agregar("Pan", 0.5).agregar("Leche", 4.5);
  expect(resultado).toBe(carrito);
  expect(carrito.total()).toBe(5);
});

test("dos carritos no comparten productos", () => {
  const a = crearCarrito();
  const b = crearCarrito();
  a.agregar("Pan", 1);
  expect(a.cantidad()).toBe(1);
  expect(b.cantidad()).toBe(0);
});

test("los métodos usan this: funcionan prestados a otro objeto", () => {
  const carrito = crearCarrito();
  const otro = {
    productos: [
      { nombre: "Café", precio: 12 },
      { nombre: "Té", precio: 8 },
    ],
    total: carrito.total,
    cantidad: carrito.cantidad,
  };
  expect(otro.total()).toBe(20);
  expect(otro.cantidad()).toBe(2);
});
