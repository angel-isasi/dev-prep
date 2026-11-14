import { test, expect, expectTypeOf } from "vitest";
import { crearUsuario, type Usuario, type DatosUsuario } from "./solucion";

test("limpia nombre y email, y empieza activo", () => {
  const u = crearUsuario(1, { nombre: "  Ana Torres ", email: "Ana@Correo.PE " });
  expect(u).toEqual({ id: 1, nombre: "Ana Torres", email: "ana@correo.pe", activo: true });
});

test("sin teléfono, el usuario no tiene la propiedad telefono", () => {
  const u = crearUsuario(1, { nombre: "Ana", email: "ana@correo.pe" });
  expect("telefono" in u).toBe(false);
});

test("con teléfono, lo guarda sin espacios", () => {
  const u = crearUsuario(2, { nombre: "Luis", email: "luis@correo.pe", telefono: " 987654321 " });
  expect(u).toEqual({ id: 2, nombre: "Luis", email: "luis@correo.pe", telefono: "987654321", activo: true });
});

test("un teléfono vacío o solo con espacios no se guarda", () => {
  const u = crearUsuario(3, { nombre: "Rosa", email: "rosa@correo.pe", telefono: "   " });
  expect("telefono" in u).toBe(false);
});

test("telefono es opcional en los dos tipos (lo revisa tsc)", () => {
  const datos: DatosUsuario = { nombre: "Ana", email: "ana@correo.pe" };
  const u: Usuario = crearUsuario(1, datos);
  expectTypeOf(u.telefono).toEqualTypeOf<string | undefined>();
  expectTypeOf(u.activo).toEqualTypeOf<boolean>();
  expectTypeOf(u.id).toEqualTypeOf<number>();
  expect(u.telefono).toBeUndefined();
});

test("se puede cambiar el nombre, pero el id es de solo lectura (lo revisa tsc)", () => {
  const u = crearUsuario(1, { nombre: "Ana", email: "ana@correo.pe" });
  u.nombre = "Ana María";
  expect(u.nombre).toBe("Ana María");
  const probar = () => {
    // @ts-expect-error id es readonly: no se puede reasignar
    u.id = 5;
  };
  expect(typeof probar).toBe("function");
});

test("nombre y email son obligatorios y de tipo string (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error falta el email
    crearUsuario(4, { nombre: "Rosa" });
    // @ts-expect-error el teléfono debe ser string, no number
    crearUsuario(5, { nombre: "Rosa", email: "rosa@correo.pe", telefono: 987654321 });
  };
  expect(typeof probar).toBe("function");
});
