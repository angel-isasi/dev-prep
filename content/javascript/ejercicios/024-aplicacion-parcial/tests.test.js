import { test, expect } from "vitest";
import { parcial } from "./solucion.js";

const saludar = (saludo, nombre) => `${saludo}, ${nombre}`;
const sumar3 = (a, b, c) => a + b + c;
const restar = (a, b) => a - b;

test("fija el primer argumento", () => {
  const hola = parcial(saludar, "Hola");
  expect(hola("Angel")).toBe("Hola, Angel");
});

test("la función nueva se puede reutilizar", () => {
  const hola = parcial(saludar, "Hola");
  hola("Angel");
  expect(hola("Rosa")).toBe("Hola, Rosa");
});

test("puede fijar varios argumentos", () => {
  expect(parcial(sumar3, 1, 2)(3)).toBe(6);
  expect(parcial(sumar3, 1)(2, 3)).toBe(6);
});

test("sin argumentos fijos se comporta igual que la original", () => {
  expect(parcial(sumar3)(1, 2, 3)).toBe(6);
});

test("los fijos van antes que los nuevos", () => {
  const diezMenos = parcial(restar, 10);
  expect(diezMenos(3)).toBe(7);
});
