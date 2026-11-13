import { test, expect } from "vitest";
import { invertirObjeto } from "./solucion.js";

test("intercambia claves y valores", () => {
  expect(invertirObjeto({ pe: "Perú", gt: "Guatemala" })).toEqual({ Perú: "pe", Guatemala: "gt" });
});

test("los valores numéricos se vuelven claves de texto", () => {
  expect(invertirObjeto({ a: 1, b: 2 })).toEqual({ 1: "a", 2: "b" });
});

test("si dos claves tienen el mismo valor, queda la última", () => {
  expect(invertirObjeto({ a: "x", b: "x" })).toEqual({ x: "b" });
});

test("un objeto vacío devuelve un objeto vacío", () => {
  expect(invertirObjeto({})).toEqual({});
});

test("no modifica el objeto original", () => {
  const paises = { pe: "Perú", gt: "Guatemala" };
  invertirObjeto(paises);
  expect(paises).toEqual({ pe: "Perú", gt: "Guatemala" });
});
