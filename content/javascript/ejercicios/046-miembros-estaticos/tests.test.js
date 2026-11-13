import { test, expect } from "vitest";
import { Voto } from "./solucion.js";

// Ojo: el total es de la clase y se comparte entre todos los tests de este archivo.
// Por eso cada test compara contra el total que había antes de crear sus votos.

test("el total empieza en 0", () => {
  expect(Voto.total).toBe(0);
});

test("desde limpia el texto y devuelve un Voto", () => {
  const voto = Voto.desde("  Bajo La Arena ");
  expect(voto).toBeInstanceOf(Voto);
  expect(voto.corto).toBe("bajo la arena");
});

test("total cuenta los votos hechos con new y con desde", () => {
  const antes = Voto.total;
  Voto.desde("  Bajo La Arena ");
  new Voto("luz de desierto");
  expect(Voto.total).toBe(antes + 2);
});

test("total y desde son de la clase, no de cada voto", () => {
  const voto = new Voto("luz de desierto");
  expect(voto.total).toBeUndefined();
  expect(voto.desde).toBeUndefined();
  expect(typeof Voto.desde).toBe("function");
});

test("total es de solo lectura", () => {
  const antes = Voto.total;
  expect(() => {
    Voto.total = 100;
  }).toThrow(TypeError);
  expect(Voto.total).toBe(antes);
});
