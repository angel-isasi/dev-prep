import { test, expect } from "vitest";
import { EOL } from "node:os";
import utilidades, { formatearPrecio, crearSlug, unirLineas } from "./solucion.js";

test("formatearPrecio pone el símbolo de soles y dos decimales", () => {
  expect(formatearPrecio(12.5)).toBe("S/ 12.50");
  expect(formatearPrecio(3)).toBe("S/ 3.00");
  expect(formatearPrecio(0.1 + 0.2)).toBe("S/ 0.30");
});

test("crearSlug pasa a minúsculas y une las palabras con guiones", () => {
  expect(crearSlug("Mi Primer Post")).toBe("mi-primer-post");
});

test("crearSlug ignora los espacios de los bordes y los repetidos", () => {
  expect(crearSlug("  Hola   Mundo  ")).toBe("hola-mundo");
});

test("unirLineas usa el salto de línea del sistema (EOL de node:os)", () => {
  expect(unirLineas(["uno", "dos", "tres"])).toBe("uno" + EOL + "dos" + EOL + "tres");
  expect(unirLineas([])).toBe("");
});

test("las tres funciones se exportan con nombre", () => {
  expect(typeof formatearPrecio).toBe("function");
  expect(typeof crearSlug).toBe("function");
  expect(typeof unirLineas).toBe("function");
});

test("el export por defecto agrupa las mismas tres funciones", () => {
  expect(utilidades.formatearPrecio).toBe(formatearPrecio);
  expect(utilidades.crearSlug).toBe(crearSlug);
  expect(utilidades.unirLineas).toBe(unirLineas);
  expect(utilidades.formatearPrecio(5)).toBe("S/ 5.00");
});
