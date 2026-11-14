import { test, expect, expectTypeOf } from "vitest";
import { esUsuario, nombresDeUsuarios, type Usuario } from "./solucion";

test("un objeto con id, nombre y email es un usuario", () => {
  expect(esUsuario({ id: 1, nombre: "Ana", email: "ana@correo.com" })).toBe(true);
});

test("las propiedades de más no molestan", () => {
  expect(esUsuario({ id: 2, nombre: "Luis", email: "luis@correo.com", edad: 30 })).toBe(true);
});

test("null, undefined, textos, números y arreglos no son usuarios", () => {
  expect(esUsuario(null)).toBe(false);
  expect(esUsuario(undefined)).toBe(false);
  expect(esUsuario("Ana")).toBe(false);
  expect(esUsuario(42)).toBe(false);
  expect(esUsuario([1, "Ana", "ana@correo.com"])).toBe(false);
});

test("falta una propiedad o tiene el tipo equivocado: no es usuario", () => {
  expect(esUsuario({ id: 1, nombre: "Ana" })).toBe(false);
  expect(esUsuario({ id: "1", nombre: "Ana", email: "ana@correo.com" })).toBe(false);
  expect(esUsuario({ id: 1, nombre: null, email: "ana@correo.com" })).toBe(false);
});

test("nombresDeUsuarios se queda solo con los usuarios, en orden", () => {
  const datos: unknown[] = [
    { id: 1, nombre: "Ana", email: "ana@correo.com" },
    "hola",
    null,
    { id: 2, nombre: "Luis" },
    { id: 3, nombre: "Rosa", email: "rosa@correo.com" },
  ];
  expect(nombresDeUsuarios(datos)).toEqual(["Ana", "Rosa"]);
  expect(nombresDeUsuarios([])).toEqual([]);
});

test("esUsuario es un type guard: dentro del if el dato es Usuario (lo revisa tsc)", () => {
  expectTypeOf(esUsuario).guards.toEqualTypeOf<Usuario>();

  const dato: unknown = JSON.parse('{"id":7,"nombre":"Mia","email":"mia@correo.com"}');
  if (esUsuario(dato)) {
    expectTypeOf(dato).toEqualTypeOf<Usuario>();
    const nombre: string = dato.nombre;
    expect(nombre).toBe("Mia");
  } else {
    throw new Error("debería ser un usuario");
  }
});

test("sin comprobar, un unknown no se puede usar (lo revisa tsc)", () => {
  const probar = (dato: unknown) => {
    // @ts-expect-error no puedes leer .nombre de un unknown sin comprobarlo antes
    return dato.nombre;
  };
  expectTypeOf(nombresDeUsuarios).returns.toEqualTypeOf<string[]>();
  expect(typeof probar).toBe("function");
});
