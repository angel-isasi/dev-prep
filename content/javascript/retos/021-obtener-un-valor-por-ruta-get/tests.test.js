import { test, expect } from "vitest";
import { obtener } from "./solucion.js";

const datos = { a: { b: [{ c: 5 }] } };

test("baja por una ruta con puntos", () => {
  expect(obtener(datos, "a.b.0.c")).toBe(5);
  expect(obtener({ usuario: { ciudad: "Ica" } }, "usuario.ciudad")).toBe("Ica");
});

test("acepta índices con corchetes", () => {
  expect(obtener(datos, "a.b[0].c")).toBe(5);
  expect(obtener({ m: [[1, 2], [3, 4]] }, "m[1][0]")).toBe(3);
});

test("si el camino no existe, devuelve el valor por defecto sin lanzar error", () => {
  expect(obtener(datos, "a.x.y", "nada")).toBe("nada");
  expect(obtener(datos, "a.b.5.c", "nada")).toBe("nada");
  expect(obtener({ a: null }, "a.b", "nada")).toBe("nada");
});

test("sin valor por defecto, devuelve undefined", () => {
  expect(obtener(datos, "a.x.y")).toBeUndefined();
});

test("los valores falsy que existen se devuelven tal cual", () => {
  const producto = { stock: 0, nombre: "", activo: false, oferta: null };
  expect(obtener(producto, "stock", 10)).toBe(0);
  expect(obtener(producto, "nombre", "sin nombre")).toBe("");
  expect(obtener(producto, "activo", true)).toBe(false);
  expect(obtener(producto, "oferta", "x")).toBe(null);
});
