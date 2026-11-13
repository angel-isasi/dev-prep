// @vitest-environment jsdom
import { test, expect } from "vitest";
import { todos, deCategoria, hastaPrecio, conTexto } from "./solucion.jsx";

const PIZZAS = [
  { nombre: "Margarita", categoria: "clásica", precio: 28 },
  { nombre: "Marinera", categoria: "clásica", precio: 40 },
  { nombre: "Vegana", categoria: "veggie", precio: 30 },
];

const nombres = (filtro) => PIZZAS.filter(filtro).map((p) => p.nombre);

test("cada fábrica devuelve un predicado", () => {
  expect(typeof deCategoria("clásica")).toBe("function");
  expect(typeof hastaPrecio(30)).toBe("function");
  expect(typeof conTexto("mar")).toBe("function");
  expect(typeof todos()).toBe("function");
});

test("deCategoria filtra por categoría y con texto vacío deja pasar todo", () => {
  expect(nombres(deCategoria("veggie"))).toEqual(["Vegana"]);
  expect(nombres(deCategoria(""))).toEqual(["Margarita", "Marinera", "Vegana"]);
});

test("hastaPrecio incluye el precio exacto", () => {
  expect(nombres(hastaPrecio(30))).toEqual(["Margarita", "Vegana"]);
});

test("conTexto no distingue mayúsculas", () => {
  expect(nombres(conTexto("MAR"))).toEqual(["Margarita", "Marinera"]);
});

test("todos combina las condiciones", () => {
  const filtro = todos(deCategoria("clásica"), hastaPrecio(35), conTexto("mar"));
  expect(nombres(filtro)).toEqual(["Margarita"]);
  expect(nombres(todos(deCategoria(""), hastaPrecio(100)))).toHaveLength(3);
});

test("todos sin condiciones deja pasar todo", () => {
  expect(nombres(todos())).toHaveLength(3);
});
