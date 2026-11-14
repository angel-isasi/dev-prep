import { test, expect, expectTypeOf } from "vitest";
import { actualizarUsuario, type Usuario } from "./solucion";

const crearAna = (): Usuario => ({ id: 1, nombre: "Ana", email: "ana@correo.com", activo: true });

test("cambia solo el nombre", () => {
  expect(actualizarUsuario(crearAna(), { nombre: "Ana María" })).toEqual({
    id: 1,
    nombre: "Ana María",
    email: "ana@correo.com",
    activo: true,
  });
});

test("cambia varios campos a la vez", () => {
  expect(actualizarUsuario(crearAna(), { email: "ana.m@correo.com", activo: false })).toEqual({
    id: 1,
    nombre: "Ana",
    email: "ana.m@correo.com",
    activo: false,
  });
});

test("no modifica el usuario original y devuelve un objeto nuevo", () => {
  const ana = crearAna();
  const nueva = actualizarUsuario(ana, { nombre: "Otra" });
  expect(ana.nombre).toBe("Ana");
  expect(nueva).not.toBe(ana);
});

test("con cambios vacíos devuelve una copia igual", () => {
  const ana = crearAna();
  const copia = actualizarUsuario(ana, {});
  expect(copia).toEqual(ana);
  expect(copia).not.toBe(ana);
});

test("el id nunca cambia aunque venga en los cambios", () => {
  expect(actualizarUsuario(crearAna(), { id: 99, nombre: "Ana" }).id).toBe(1);
});

test("cambios es Partial<Usuario> (lo revisa tsc)", () => {
  expectTypeOf(actualizarUsuario).parameter(1).toEqualTypeOf<Partial<Usuario>>();
  const resultado: Usuario = actualizarUsuario(crearAna(), { activo: false });
  expect(resultado.activo).toBe(false);
});

test("rechaza propiedades inventadas y tipos equivocados (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error "edad" no es una propiedad de Usuario
    actualizarUsuario(crearAna(), { edad: 20 });
    // @ts-expect-error activo debe ser boolean, no string
    actualizarUsuario(crearAna(), { activo: "si" });
  };
  expect(typeof probar).toBe("function");
});
