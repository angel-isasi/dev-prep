import { test, expect } from "vitest";
import { Producto } from "./solucion.js";

test("guarda el precio y calcula el precio con IGV", () => {
  const pizza = new Producto("Pizza", 30);
  expect(pizza.nombre).toBe("Pizza");
  expect(pizza.precio).toBe(30);
  expect(pizza.conIgv).toBe(35.4);
});

test("rechaza un precio negativo y conserva el anterior", () => {
  const pizza = new Producto("Pizza", 30);
  expect(() => {
    pizza.precio = -5;
  }).toThrow("Precio inválido");
  expect(pizza.precio).toBe(30);
});

test("rechaza precios que no son números válidos", () => {
  const pizza = new Producto("Pizza", 30);
  expect(() => {
    pizza.precio = "50";
  }).toThrow("Precio inválido");
  expect(() => {
    pizza.precio = NaN;
  }).toThrow("Precio inválido");
  expect(pizza.precio).toBe(30);
});

test("acepta cambiar a un precio válido, incluido 0", () => {
  const pizza = new Producto("Pizza", 30);
  pizza.precio = 10;
  expect(pizza.precio).toBe(10);
  pizza.precio = 0;
  expect(pizza.precio).toBe(0);
});

test("conIgv se recalcula con el precio actual y se redondea a 2 decimales", () => {
  const pizza = new Producto("Pizza", 30);
  pizza.precio = 10;
  expect(pizza.conIgv).toBe(11.8);
});

test("el constructor también valida el precio", () => {
  expect(() => new Producto("Agua", -1)).toThrow("Precio inválido");
});
