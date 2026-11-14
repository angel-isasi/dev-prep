import { test, expect, expectTypeOf } from "vitest";
import { agruparPor } from "./solucion";

interface Producto {
  nombre: string;
  categoria: string;
  precio: number;
}

interface Tarea {
  titulo: string;
  hecha: boolean;
}

const polo: Producto = { nombre: "Polo", categoria: "ropa", precio: 30 };
const mouse: Producto = { nombre: "Mouse", categoria: "tecnologia", precio: 50 };
const jean: Producto = { nombre: "Jean", categoria: "ropa", precio: 90 };
const productos: Producto[] = [polo, mouse, jean];

test("agrupa productos por categoría", () => {
  expect(agruparPor(productos, "categoria")).toEqual({
    ropa: [polo, jean],
    tecnologia: [mouse],
  });
});

test("dentro de cada grupo respeta el orden original", () => {
  const grupos = agruparPor(productos, "categoria");
  expect(grupos.ropa.map((p) => p.nombre)).toEqual(["Polo", "Jean"]);
});

test("los valores se convierten a texto: booleanos dan \"true\" y \"false\"", () => {
  const tareas: Tarea[] = [
    { titulo: "Diseñar login", hecha: true },
    { titulo: "Conectar API", hecha: false },
    { titulo: "Escribir tests", hecha: false },
  ];
  const grupos = agruparPor(tareas, "hecha");
  expect(Object.keys(grupos).sort()).toEqual(["false", "true"]);
  expect(grupos["false"]).toHaveLength(2);
  expect(grupos["true"][0].titulo).toBe("Diseñar login");
});

test("una lista vacía da un objeto vacío", () => {
  expect(agruparPor([] as Producto[], "categoria")).toEqual({});
});

test("no modifica la lista original", () => {
  const copia = [...productos];
  agruparPor(productos, "precio");
  expect(productos).toEqual(copia);
});

test("el resultado está tipado como Record<string, T[]> (lo revisa tsc)", () => {
  const grupos = agruparPor(productos, "categoria");
  expectTypeOf(grupos).toEqualTypeOf<Record<string, Producto[]>>();
  const nombres: string[] = (grupos.ropa ?? []).map((p) => p.nombre);
  expect(nombres).toEqual(["Polo", "Jean"]);
});

test("solo acepta claves que existen en el tipo (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error "color" no es una propiedad de Producto
    agruparPor(productos, "color");
  };
  expect(typeof probar).toBe("function");
});
