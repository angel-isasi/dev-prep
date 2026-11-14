import { test, expect, expectTypeOf } from "vitest";
import { datosPublicos, resumen, type Usuario, type UsuarioPublico, type ResumenUsuario } from "./solucion";

const crearAna = (): Usuario => ({
  id: 1,
  nombre: "Ana",
  email: "ana@correo.com",
  password: "secreta123",
  rol: "cliente",
});

test("datosPublicos devuelve todo menos password", () => {
  expect(datosPublicos(crearAna())).toEqual({ id: 1, nombre: "Ana", email: "ana@correo.com", rol: "cliente" });
});

test("la propiedad password no existe en el resultado (ni siquiera vacía)", () => {
  const publico = datosPublicos(crearAna());
  expect("password" in publico).toBe(false);
  expect(Object.keys(publico).sort()).toEqual(["email", "id", "nombre", "rol"]);
});

test("no modifica el usuario original", () => {
  const ana = crearAna();
  datosPublicos(ana);
  resumen(ana);
  expect(ana.password).toBe("secreta123");
});

test("resumen devuelve solo id y nombre", () => {
  const r = resumen(crearAna());
  expect(r).toEqual({ id: 1, nombre: "Ana" });
  expect(Object.keys(r).sort()).toEqual(["id", "nombre"]);
});

test("resumen sirve para armar una lista con map", () => {
  const luis: Usuario = { id: 2, nombre: "Luis", email: "luis@correo.com", password: "x", rol: "admin" };
  expect([crearAna(), luis].map(resumen)).toEqual([
    { id: 1, nombre: "Ana" },
    { id: 2, nombre: "Luis" },
  ]);
});

test("UsuarioPublico y ResumenUsuario tienen la forma correcta (lo revisa tsc)", () => {
  expectTypeOf<UsuarioPublico>().toEqualTypeOf<{
    id: number;
    nombre: string;
    email: string;
    rol: "admin" | "cliente";
  }>();
  expectTypeOf<ResumenUsuario>().toEqualTypeOf<{ id: number; nombre: string }>();
  expectTypeOf(datosPublicos).returns.toEqualTypeOf<UsuarioPublico>();
});

test("TypeScript no deja leer password de los datos públicos (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error password no existe en UsuarioPublico
    return datosPublicos(crearAna()).password;
  };
  expect(typeof probar).toBe("function");
});
