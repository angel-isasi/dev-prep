import { test, expect, expectTypeOf } from "vitest";
import { ordenarPor, valoresDe, type Direccion } from "./solucion";

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
}

const crearProductos = (): Producto[] => [
  { nombre: "teclado", precio: 120, stock: 5 },
  { nombre: "mouse", precio: 45, stock: 20 },
  { nombre: "audífonos", precio: 80, stock: 5 },
];

const nombres = (lista: Producto[]) => lista.map((p) => p.nombre);

test("ordena por un campo numérico de menor a mayor (asc por defecto)", () => {
  expect(nombres(ordenarPor(crearProductos(), "precio"))).toEqual(["mouse", "audífonos", "teclado"]);
});

test("con \"desc\" ordena de mayor a menor", () => {
  expect(nombres(ordenarPor(crearProductos(), "precio", "desc"))).toEqual(["teclado", "audífonos", "mouse"]);
});

test("ordena textos alfabéticamente, con tildes", () => {
  expect(nombres(ordenarPor(crearProductos(), "nombre"))).toEqual(["audífonos", "mouse", "teclado"]);
  expect(nombres(ordenarPor(crearProductos(), "nombre", "desc"))).toEqual(["teclado", "mouse", "audífonos"]);
});

test("no modifica la lista original y los empates conservan su orden", () => {
  const productos = crearProductos();
  const ordenados = ordenarPor(productos, "stock");
  expect(nombres(productos)).toEqual(["teclado", "mouse", "audífonos"]);
  expect(ordenados).not.toBe(productos);
  expect(nombres(ordenados)).toEqual(["teclado", "audífonos", "mouse"]);
});

test("valoresDe devuelve los valores de un campo en orden", () => {
  expect(valoresDe(crearProductos(), "precio")).toEqual([120, 45, 80]);
  expect(valoresDe(crearProductos(), "nombre")).toEqual(["teclado", "mouse", "audífonos"]);
  expect(valoresDe([] as Producto[], "stock")).toEqual([]);
});

test("los tipos siguen al campo: T[] y T[K][] (lo revisa tsc)", () => {
  expectTypeOf(ordenarPor(crearProductos(), "precio")).toEqualTypeOf<Producto[]>();
  expectTypeOf(valoresDe(crearProductos(), "precio")).toEqualTypeOf<number[]>();
  expectTypeOf(valoresDe(crearProductos(), "nombre")).toEqualTypeOf<string[]>();
  expectTypeOf<Direccion>().toEqualTypeOf<"asc" | "desc">();
});

test("rechaza campos inexistentes y direcciones inventadas (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error "color" no es un campo de Producto
    ordenarPor(crearProductos(), "color");
    // @ts-expect-error la dirección solo puede ser "asc" o "desc"
    ordenarPor(crearProductos(), "precio", "arriba");
  };
  expect(typeof probar).toBe("function");
});
