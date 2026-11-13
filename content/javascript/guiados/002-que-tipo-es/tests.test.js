import { test, expect } from "vitest";
import { tipoDe } from "./solucion.js";

test("tipos primitivos comunes", () => {
  expect(tipoDe("hola")).toBe("string");
  expect(tipoDe(42)).toBe("number");
  expect(tipoDe(true)).toBe("boolean");
  expect(tipoDe(undefined)).toBe("undefined");
});

test("NaN es de tipo number", () => {
  expect(tipoDe(NaN)).toBe("number");
});

test("null devuelve \"null\" y no \"object\"", () => {
  expect(tipoDe(null)).toBe("null");
});

test("los arrays devuelven \"array\", incluso vacíos", () => {
  expect(tipoDe([1, 2, 3])).toBe("array");
  expect(tipoDe([])).toBe("array");
});

test("objetos y funciones", () => {
  expect(tipoDe({ nombre: "Ana" })).toBe("object");
  expect(tipoDe({})).toBe("object");
  expect(tipoDe(() => 1)).toBe("function");
});
