import { test, expect, vi, afterEach } from "vitest";
import { clonar } from "./solucion.js";

afterEach(() => {
  vi.restoreAllMocks();
});

test("cambiar algo anidado en la copia no toca el original", () => {
  const original = { a: 1, b: { c: [1, 2, { d: 3 }] } };
  const copia = clonar(original);
  copia.b.c[2].d = 99;
  copia.b.c.push(4);
  expect(original).toEqual({ a: 1, b: { c: [1, 2, { d: 3 }] } });
});

test("la copia tiene el mismo contenido pero objetos y arreglos nuevos", () => {
  const original = { lista: [{ id: 1 }, { id: 2 }], datos: { activo: true } };
  const copia = clonar(original);
  expect(copia).toEqual(original);
  expect(copia).not.toBe(original);
  expect(copia.lista).not.toBe(original.lista);
  expect(copia.lista[0]).not.toBe(original.lista[0]);
  expect(copia.datos).not.toBe(original.datos);
});

test("las fechas se clonan como fechas nuevas con el mismo momento", () => {
  const original = { f: new Date(0) };
  const copia = clonar(original);
  expect(copia.f).toBeInstanceOf(Date);
  expect(copia.f, "la fecha debe ser otro objeto").not.toBe(original.f);
  expect(copia.f.getTime()).toBe(0);
});

test("los primitivos y null se devuelven tal cual", () => {
  expect(clonar(5)).toBe(5);
  expect(clonar("Ica")).toBe("Ica");
  expect(clonar(null)).toBe(null);
  expect(clonar(undefined)).toBe(undefined);
  expect(clonar({ x: null, y: undefined })).toEqual({ x: null, y: undefined });
});

test("también clona arreglos de arreglos, sin usar structuredClone", () => {
  if (typeof structuredClone === "function") vi.spyOn(globalThis, "structuredClone");
  const original = [[1, 2], [3, [4, 5]]];
  const copia = clonar(original);
  copia[1][1][0] = 40;
  expect(original).toEqual([[1, 2], [3, [4, 5]]]);
  expect(copia).toEqual([[1, 2], [3, [40, 5]]]);
  if (typeof structuredClone === "function") {
    expect(structuredClone, "el reto es clonar a mano").not.toHaveBeenCalled();
  }
});
