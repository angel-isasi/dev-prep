import { test, expect, expectTypeOf } from "vitest";
import { validar, requerido, minLargo, type Reglas } from "./solucion";

type Registro = { usuario: string; password: string; edad: number };

const mayorDeEdad = (edad: number) => (edad >= 18 ? null : "Debes ser mayor de edad");

const reglas: Reglas<Registro> = {
  usuario: [requerido(), minLargo(3)],
  password: [requerido("Escribe una contraseña"), minLargo(8)],
  edad: [mayorDeEdad],
};

test("si todo está bien devuelve un objeto vacío", () => {
  expect(validar({ usuario: "angel", password: "12345678", edad: 20 }, reglas)).toEqual({});
});

test("requerido falla con texto vacío o solo espacios, con su mensaje", () => {
  const errores = validar({ usuario: "   ", password: "", edad: 20 }, reglas);
  expect(errores.usuario).toBe("Este campo es obligatorio");
  expect(errores.password).toBe("Escribe una contraseña");
});

test("minLargo dice cuántos caracteres faltan como mínimo", () => {
  expect(validar({ usuario: "al", password: "123", edad: 20 }, reglas)).toEqual({
    usuario: "Debe tener al menos 3 caracteres",
    password: "Debe tener al menos 8 caracteres",
  });
});

test("solo guarda el primer error de cada campo", () => {
  // "" falla requerido y también minLargo(8): solo se ve el de requerido.
  expect(validar({ usuario: "angel", password: "", edad: 20 }, reglas)).toEqual({
    password: "Escribe una contraseña",
  });
});

test("acepta reglas propias para campos que no son texto", () => {
  expect(validar({ usuario: "angel", password: "12345678", edad: 16 }, reglas)).toEqual({
    edad: "Debes ser mayor de edad",
  });
});

test("los campos sin reglas no se revisan", () => {
  const soloUsuario: Reglas<Registro> = { usuario: [requerido()] };
  expect(validar({ usuario: "", password: "", edad: 1 }, soloUsuario)).toEqual({
    usuario: "Este campo es obligatorio",
  });
});

test("los tipos conectan cada regla con su campo (lo revisa tsc)", () => {
  const errores = validar({ usuario: "", password: "", edad: 0 }, reglas);
  expectTypeOf(errores).toEqualTypeOf<Partial<Record<"usuario" | "password" | "edad", string>>>();
  const datos: Registro = { usuario: "", password: "", edad: 0 };
  const probar = () => {
    // @ts-expect-error "apellido" no es un campo de Registro
    validar(datos, { apellido: [requerido()] });
    // @ts-expect-error requerido() revisa textos y "edad" es un número
    validar(datos, { edad: [requerido()] });
    // @ts-expect-error una regla devuelve string o null, no boolean
    validar(datos, { usuario: [(valor: string) => valor.length > 3] });
  };
  expect(typeof probar).toBe("function");
});
