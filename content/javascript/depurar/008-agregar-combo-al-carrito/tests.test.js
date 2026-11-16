import { test, expect } from "vitest";
import { Carrito } from "./solucion.js";

const combo = [
  { nombre: "Hamburguesa", precio: 15 },
  { nombre: "Papas", precio: 6 },
  { nombre: "Gaseosa", precio: 4 },
];

test("agregar un combo no lanza error", () => {
  const carrito = new Carrito();
  expect(() => carrito.agregarVarios(combo)).not.toThrow();
});

test("el combo agrega todos sus productos", () => {
  const carrito = new Carrito();
  carrito.agregarVarios(combo);
  expect(carrito.items.map((i) => i.nombre)).toEqual(["Hamburguesa", "Papas", "Gaseosa"]);
});

test("el total suma productos sueltos y combos", () => {
  const carrito = new Carrito();
  carrito.agregar({ nombre: "Helado", precio: 5 });
  carrito.agregarVarios(combo);
  expect(carrito.total()).toBe(30);
});

test("agregar productos uno por uno sigue funcionando", () => {
  const carrito = new Carrito();
  carrito.agregar({ nombre: "Agua", precio: 2 });
  expect(carrito.total()).toBe(2);
});
