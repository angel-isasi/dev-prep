import { describe, test, expect } from "vitest";
import { generarHuecos, METODOS, HUECO } from "./huecos.js";

const ej = { id: "js-x", titulo: "Duplicar" };
const generar = (solucion, extra = {}) =>
  generarHuecos({ ej, unidad: "metodos-de-array", solucion, lenguaje: "js", ideaClave: "Transformar cada uno.", ...extra });

describe("completar el hueco", () => {
  test("cambia un método que aparece una sola vez por ____ y lo pide entre 4", () => {
    const [item] = generar("// duplica\nexport function duplicar(nums) {\n  return nums.map((n) => n * 2); // cada uno\n}\n");
    expect(item).toMatchObject({ clave: "hueco:js-x:map", tipo: "hueco", unidad: "metodos-de-array" });
    expect(item.codigo).toEqual({ lenguaje: "js", texto: `export function duplicar(nums) {\n  return nums.${HUECO}((n) => n * 2);\n}` });
    expect(item.opciones).toHaveLength(4);
    expect(item.opciones[item.correcta]).toBe("`map`");
    expect(item.opciones).toEqual(expect.arrayContaining(["`filter`", "`find`", "`some`"]));
    expect(item.explicacion).toContain("Idea clave");
  });

  test("ningún distractor equivalente a la respuesta en la tabla", () => {
    const equivalentes = [
      ["map", "forEach"],
      ["slice", "substring"],
      ["floor", "trunc"],
      ["toString", "join"],
      ["find", "some"],
      ["trim", "trimStart"],
    ];
    for (const m of METODOS) {
      expect(new Set([m.respuesta, ...m.distractores]).size).toBe(4);
      for (const [a, b] of equivalentes) {
        expect(m.respuesta === a && m.distractores.includes(b)).toBe(false);
        expect(m.respuesta === b && m.distractores.includes(a)).toBe(false);
      }
    }
  });

  test("si el método aparece dos veces, no sirve", () => {
    expect(generar("export const f = (a) => a.map((x) => x).map((x) => x + 1);")).toEqual([]);
  });

  test("como mucho 2 huecos por ejercicio", () => {
    const codigo = 'export const f = (t) => t.trim().toLowerCase().split(" ").filter(Boolean).join("-");';
    const items = generar(codigo);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.clave)).toEqual(["hueco:js-x:trim", "hueco:js-x:toLowerCase"]);
  });

  test("no usa Object.keys(...).length ni path.join (ahí otras opciones darían lo mismo o no aplican)", () => {
    expect(generar("export const n = (o) => Object.keys(o).length;")).toEqual([]);
    expect(generar('import path from "node:path";\nexport const r = (a) => path.join(a, "b");')).toEqual([]);
  });

  test("descarta si la respuesta queda a la vista en otra parte", () => {
    expect(generar("export function f(a) {\n  const max = 3;\n  return Math.max(a, max);\n}")).toEqual([]);
  });

  test("sin imports en el código mostrado (delatarían el hook)", () => {
    const [item] = generar('import { useState } from "react";\nexport function C() {\n  const [n, setN] = useState(0);\n  return n;\n}', { lenguaje: "jsx" });
    expect(item.codigo.texto).not.toContain("import");
    expect(item.opciones[item.correcta]).toBe("`useState`");
  });

  test("en una solución larga muestra una ventana de ±8 líneas", () => {
    const relleno = Array.from({ length: 30 }, (_, i) => `  const v${i} = ${i};`);
    const codigo = ["export function f(a) {", ...relleno, "  return a.filter(Boolean);", "}"].join("\n");
    const [item] = generar(codigo);
    expect(item.codigo.texto.split("\n")).toHaveLength(10);
    expect(item.codigo.texto).toContain(`a.${HUECO}(Boolean)`);
  });
});
