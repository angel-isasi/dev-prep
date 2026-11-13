// @vitest-environment jsdom
import { test, expect } from "vitest";
import { useState } from "react";
import { probarUseCarrito } from "./solucion.jsx";

// Tu función `probarUseCarrito` se corre contra el hook correcto (debe pasar)
// y contra versiones con errores (debe fallar, o sea, lanzar un error).

// ===== El hook correcto (el del enunciado) =====
function useCarrito() {
  const [items, setItems] = useState([]);
  const agregar = (item) => setItems((i) => [...i, item]);
  const vaciar = () => setItems([]);
  const total = items.reduce((s, i) => s + i.precio, 0);
  return { items, total, agregar, vaciar };
}

// ===== Versiones con errores =====

// agregar reemplaza el carrito en vez de sumar el item.
function useCarritoReemplaza() {
  const [items, setItems] = useState([]);
  const agregar = (item) => setItems([item]);
  const vaciar = () => setItems([]);
  const total = items.reduce((s, i) => s + i.precio, 0);
  return { items, total, agregar, vaciar };
}

// El total cuenta items en lugar de sumar precios.
function useCarritoTotalMal() {
  const [items, setItems] = useState([]);
  const agregar = (item) => setItems((i) => [...i, item]);
  const vaciar = () => setItems([]);
  const total = items.length;
  return { items, total, agregar, vaciar };
}

// vaciar no hace nada.
function useCarritoNoVacia() {
  const [items, setItems] = useState([]);
  const agregar = (item) => setItems((i) => [...i, item]);
  const vaciar = () => {};
  const total = items.reduce((s, i) => s + i.precio, 0);
  return { items, total, agregar, vaciar };
}

// Empieza con un item de regalo que nadie pidió.
function useCarritoNoEmpiezaVacio() {
  const [items, setItems] = useState([{ nombre: "Gaseosa", precio: 5 }]);
  const agregar = (item) => setItems((i) => [...i, item]);
  const vaciar = () => setItems([]);
  const total = items.reduce((s, i) => s + i.precio, 0);
  return { items, total, agregar, vaciar };
}

test("tu prueba pasa con el useCarrito correcto", () => {
  probarUseCarrito(useCarrito);
});

test("tu prueba detecta un agregar que reemplaza en vez de sumar", () => {
  expect(() => probarUseCarrito(useCarritoReemplaza)).toThrow();
});

test("tu prueba detecta un total mal calculado", () => {
  expect(() => probarUseCarrito(useCarritoTotalMal)).toThrow();
});

test("tu prueba detecta un vaciar que no vacía", () => {
  expect(() => probarUseCarrito(useCarritoNoVacia)).toThrow();
});

test("tu prueba detecta un carrito que no empieza vacío", () => {
  expect(() => probarUseCarrito(useCarritoNoEmpiezaVacio)).toThrow();
});
