import { describe, test, expect } from "vitest";
import { generarOrdenar, hayIntercambiables, intercambiables, lineasDeCodigo } from "./ordenar.js";

const ej = { id: "js-x", titulo: "Contar" };
const generar = (solucion) => generarOrdenar({ ej, unidad: "funciones", solucion, lenguaje: "js", ideaClave: "Recorre y cuenta." });

const CONTAR = `// Cuenta los positivos
export function contar(nums) {
  let total = 0; // empieza en cero

  for (const n of nums) {
    if (n > 0) total++;
  }
  return total;
}
`;

describe("ordenar", () => {
  test("líneas sin comentarios ni vacías, con su sangría", () => {
    const [item] = generar(CONTAR);
    expect(item).toMatchObject({ clave: "ordenar:js-x", tipo: "ordenar", unidad: "funciones", lenguaje: "js" });
    expect(item.lineas).toEqual([
      "export function contar(nums) {",
      "  let total = 0;",
      "  for (const n of nums) {",
      "    if (n > 0) total++;",
      "  }",
      "  return total;",
      "}",
    ]);
    expect(item.explicacion).toContain("Recorre y cuenta.");
  });

  test("quita imports y descarta soluciones muy cortas o muy largas", () => {
    expect(lineasDeCodigo('import { a } from "./a.js";\nexport const b = a;')).toEqual(["export const b = a;"]);
    expect(generar("export const f = (x) => x;\n")).toEqual([]);
    const larga = ["export function f() {", ...Array.from({ length: 12 }, (_, i) => `  g(${i});`), "}"].join("\n");
    expect(generar(larga)).toEqual([]);
  });

  test("descarta si hay dos funciones de nivel superior", () => {
    expect(generar("export function a() {\n  return 1;\n}\nexport function b() {\n  return 2;\n}\n")).toEqual([]);
  });

  test("dos const independientes se pueden intercambiar: se descarta", () => {
    expect(intercambiables("const a = x.trim();", "const b = y.trim();")).toBe(true);
    expect(intercambiables("const a = x.trim();", "const b = a.length;")).toBe(false);
    expect(intercambiables("lista.push(1);", "lista.push(2);")).toBe(false);
    expect(intercambiables("const a = 1;", "return a;")).toBe(false);
    const sol = "export function f(x, y) {\n  const a = x.trim();\n  const b = y.trim();\n  return a + b;\n}";
    expect(generar(sol)).toEqual([]);
  });

  test("claves de un objeto, props de JSX, else if y métodos de una clase también son intercambiables", () => {
    expect(hayIntercambiables(["return {", "  a: 1,", "  b: 2,", "};"])).toBe(true);
    expect(hayIntercambiables(["<input", '  type="text"', "  value={v}", "/>"])).toBe(true);
    expect(hayIntercambiables(["if (a) {", "  x();", "} else if (b) {", "  y();", "}"])).toBe(true);
    const clase = "export class A {\n  #n = 0;\n  sumar() {\n    this.#n++;\n  }\n  valor() {\n    return this.#n;\n  }\n}";
    expect(generar(clase)).toEqual([]);
  });
});
