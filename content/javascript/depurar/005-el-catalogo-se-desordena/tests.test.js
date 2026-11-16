import { test, expect } from "vitest";
import { ordenarPorPrecio } from "./solucion.js";

const crearCatalogo = () => [
  { nombre: "Polo", precio: 45 },
  { nombre: "Gorra", precio: 25 },
  { nombre: "Casaca", precio: 120 },
];

test("ordena de menor a mayor precio", () => {
  const nombres = ordenarPorPrecio(crearCatalogo()).map((p) => p.nombre);
  expect(nombres).toEqual(["Gorra", "Polo", "Casaca"]);
});

test("el catálogo original conserva su orden de Destacados", () => {
  const catalogo = crearCatalogo();
  ordenarPorPrecio(catalogo);
  expect(catalogo.map((p) => p.nombre)).toEqual(["Polo", "Gorra", "Casaca"]);
});

test("devuelve un arreglo nuevo, no el mismo", () => {
  const catalogo = crearCatalogo();
  expect(ordenarPorPrecio(catalogo)).not.toBe(catalogo);
});

test("con un catálogo vacío devuelve un arreglo vacío", () => {
  expect(ordenarPorPrecio([])).toEqual([]);
});
