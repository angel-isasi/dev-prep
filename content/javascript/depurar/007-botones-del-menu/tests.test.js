import { test, expect } from "vitest";
import { crearAcciones } from "./solucion.js";

test("cada botón dice su propia opción, no undefined", () => {
  const acciones = crearAcciones(["Inicio", "Perfil", "Salir"]);
  expect(acciones[0]()).toBe("Elegiste: Inicio (n.º 1)");
});

test("cada función recuerda su posición", () => {
  const acciones = crearAcciones(["Inicio", "Perfil", "Salir"]);
  expect(acciones.map((accion) => accion())).toEqual([
    "Elegiste: Inicio (n.º 1)",
    "Elegiste: Perfil (n.º 2)",
    "Elegiste: Salir (n.º 3)",
  ]);
});

test("devuelve una función por opción", () => {
  const acciones = crearAcciones(["A", "B"]);
  expect(acciones).toHaveLength(2);
  expect(typeof acciones[1]).toBe("function");
});

test("sin opciones devuelve un arreglo vacío", () => {
  expect(crearAcciones([])).toEqual([]);
});
