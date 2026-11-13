import { test, expect } from "vitest";
import { pick, omit } from "./solucion.js";

const usuario = () => ({ id: 1, nombre: "Ana", clave: "secreta" });

test("pick se queda solo con las claves pedidas", () => {
  expect(pick(usuario(), ["id", "nombre"])).toEqual({ id: 1, nombre: "Ana" });
});

test("pick ignora las claves que no existen", () => {
  const resultado = pick(usuario(), ["id", "edad"]);
  expect(resultado).toEqual({ id: 1 });
  expect("edad" in resultado, "una clave inexistente no debe aparecer").toBe(false);
});

test("pick copia también valores falsy que sí existen", () => {
  expect(pick({ a: 0, b: null, c: undefined, d: "" }, ["a", "b", "c", "d"])).toStrictEqual({
    a: 0,
    b: null,
    c: undefined,
    d: "",
  });
});

test("omit quita las claves indicadas, existan o no", () => {
  expect(omit(usuario(), ["clave"])).toEqual({ id: 1, nombre: "Ana" });
  expect(omit(usuario(), ["clave", "xyz"])).toEqual({ id: 1, nombre: "Ana" });
  expect(omit(usuario(), [])).toEqual(usuario());
});

test("ninguna modifica el original y las dos devuelven un objeto nuevo", () => {
  const u = usuario();
  const elegido = pick(u, ["id", "nombre", "clave"]);
  const sinNada = omit(u, []);
  expect(u).toEqual(usuario());
  expect(elegido).not.toBe(u);
  expect(sinNada).not.toBe(u);
});
