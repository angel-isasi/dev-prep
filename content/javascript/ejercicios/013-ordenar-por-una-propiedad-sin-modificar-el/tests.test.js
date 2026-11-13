import { test, expect } from "vitest";
import { ordenarPor } from "./solucion.js";

const crearAlumnos = () => [
  { nombre: "Luz", nota: 15 },
  { nombre: "Ana", nota: 18 },
  { nombre: "Eva", nota: 8 },
];

test("ordena alfabéticamente por una propiedad de texto", () => {
  const resultado = ordenarPor(crearAlumnos(), "nombre");
  expect(resultado.map((a) => a.nombre)).toEqual(["Ana", "Eva", "Luz"]);
});

test("ordena de menor a mayor por una propiedad numérica", () => {
  const resultado = ordenarPor(crearAlumnos(), "nota");
  expect(resultado.map((a) => a.nota)).toEqual([8, 15, 18]);
});

test("no modifica el arreglo original", () => {
  const alumnos = crearAlumnos();
  ordenarPor(alumnos, "nombre");
  expect(alumnos[0].nombre).toBe("Luz");
  expect(alumnos).toEqual(crearAlumnos());
});

test("devuelve un arreglo nuevo aunque ya esté ordenado", () => {
  const lista = [{ nota: 1 }, { nota: 2 }];
  const resultado = ordenarPor(lista, "nota");
  expect(resultado).toEqual([{ nota: 1 }, { nota: 2 }]);
  expect(resultado).not.toBe(lista);
});

test("una lista vacía devuelve un arreglo vacío", () => {
  expect(ordenarPor([], "nota")).toEqual([]);
});
