import { test, expect, vi } from "vitest";
import { cargarNombres } from "./solucion.js";

const BASE = {
  1: { id: 1, nombre: "Ana" },
  2: { id: 2, nombre: "Luis" },
  3: { id: 3, nombre: "Rosa" },
};

// Simula la API: cada usuario tarda un tiempo distinto en llegar.
const obtenerUsuario = (id) =>
  new Promise((resolver) => setTimeout(() => resolver(BASE[id]), 30 - id * 10));

test("devuelve los nombres, no undefined", async () => {
  expect(await cargarNombres([1, 2], obtenerUsuario)).toEqual(["Ana", "Luis"]);
});

test("respeta el orden de los ids aunque las respuestas lleguen desordenadas", async () => {
  expect(await cargarNombres([1, 2, 3], obtenerUsuario)).toEqual(["Ana", "Luis", "Rosa"]);
});

test("pide todos los usuarios a la vez, sin esperar uno por uno", async () => {
  const espia = vi.fn(obtenerUsuario);
  const promesa = cargarNombres([1, 2, 3], espia);
  expect(espia).toHaveBeenCalledTimes(3);
  await promesa;
});

test("sin ids devuelve un arreglo vacío", async () => {
  expect(await cargarNombres([], obtenerUsuario)).toEqual([]);
});
