import { test, expect } from "vitest";
import { crearProducto } from "./solucion.js";

test("un producto agotado conserva su stock 0", () => {
  expect(crearProducto({ nombre: "Polo", stock: 0 }).stock).toBe(0);
});

test("si no llega nada, completa todos los valores por defecto", () => {
  expect(crearProducto({})).toEqual({ nombre: "Sin nombre", categoria: "general", stock: 10 });
});

test("stock null usa el valor por defecto", () => {
  expect(crearProducto({ stock: null }).stock).toBe(10);
});

test("los textos vacíos usan el valor por defecto", () => {
  const producto = crearProducto({ nombre: "", categoria: "" });
  expect(producto.nombre).toBe("Sin nombre");
  expect(producto.categoria).toBe("general");
});

test("respeta los datos que sí llegaron", () => {
  expect(crearProducto({ nombre: "Gorra", categoria: "accesorios", stock: 3 })).toEqual({
    nombre: "Gorra",
    categoria: "accesorios",
    stock: 3,
  });
});
