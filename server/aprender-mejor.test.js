import { describe, expect, test } from "vitest";
import { puntuarRevision } from "./aprender-mejor.js";
import { generarBug } from "../scripts/items/aprender-mejor.js";

describe("revisión de código", () => {
  const caso = { hallazgos: [{ linea: 3 }, { linea: 8 }, { linea: 12 }] };
  test("cuenta los hallazgos encontrados y resta las falsas alarmas", () => {
    expect(puntuarRevision(caso, [3, 8, 20])).toMatchObject({ encontrados: 2, total: 3, falsasAlarmas: 1, puntaje: 1 });
  });
  test("una línea pegada a un hallazgo no es falsa alarma", () => {
    expect(puntuarRevision(caso, [3, 9]).falsasAlarmas).toBe(0);
  });
});

describe("¿en qué línea está el error?", () => {
  const inicio = "export function total(precios) {\n  let suma = 0;\n  for (let i = 0; i <= precios.length; i++) {\n    suma += precios[i];\n  }\n  return suma;\n}";
  const solucion = inicio.replace("i <= precios", "i < precios");
  test("la línea correcta es la que cambia la solución", () => {
    const it = generarBug({ ej: { id: "js-dep-001", titulo: "Total", ext: "js" }, unidad: "arrays", inicio, solucion, ideaClave: "" });
    expect(it.opciones[it.correcta]).toContain("Línea 3");
    expect(it.explicacion).toContain("i < precios.length");
  });
});
