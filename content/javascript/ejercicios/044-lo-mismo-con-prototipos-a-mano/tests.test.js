import { test, expect } from "vitest";
import { crearUsuario } from "./solucion.js";

test("saludar usa el nombre de cada usuario", () => {
  expect(crearUsuario("Ana").saludar()).toBe("Hola, soy Ana");
  expect(crearUsuario("Luis").saludar()).toBe("Hola, soy Luis");
});

test("todos los usuarios comparten la misma función saludar", () => {
  const a = crearUsuario("Ana");
  const b = crearUsuario("Luis");
  expect(a.saludar).toBe(b.saludar);
});

test("saludar vive en el prototipo, no en el objeto", () => {
  const a = crearUsuario("Ana");
  expect(Object.hasOwn(a, "saludar")).toBe(false);
  expect(typeof Object.getPrototypeOf(a).saludar).toBe("function");
});

test("el nombre sí es propio de cada usuario", () => {
  const a = crearUsuario("Ana");
  expect(Object.hasOwn(a, "nombre")).toBe(true);
  expect(a.nombre).toBe("Ana");
});

test("los dos usuarios tienen el mismo prototipo", () => {
  const a = crearUsuario("Ana");
  const b = crearUsuario("Luis");
  expect(Object.getPrototypeOf(a)).toBe(Object.getPrototypeOf(b));
});
