import { describe, test, expect } from "vitest";
import { generarTs, OPCIONES_TS } from "./typescript.js";

const SOLUCION = `// Un producto de la tienda
export interface Producto {
  nombre: string;
  precio: number; // en soles
}

export function total(productos: Producto[]): number {
  return productos.reduce((s, p) => s + p.precio, 0);
}

export function nombres(productos: Producto[]): string[] {
  return productos.map((p) => p.nombre);
}
`;

const TESTS = `import { test, expect } from "vitest";
import { total, nombres, type Producto } from "./solucion";

const pan: Producto = { nombre: "Pan", precio: 1 };

test("suma", () => {
  expect(total([pan])).toBe(1);
});

test("tipos (lo revisa tsc)", () => {
  const lista: Producto[] = [pan];
  const suma: number = total(lista);
  expect(suma).toBe(1);
  const r = Math.random() > 2 ? null : pan;
  if (r) {
    const n: string = r.nombre;
    expect(n).toBe("Pan");
  }
  const probar = () => {
    // @ts-expect-error el precio debe ser number
    total([{ nombre: "Leche", precio: "4" }]);
    // @ts-expect-error
    nombres(5);
    // @ts-expect-error otro no está declarado aquí
    nombres(otro);
  };
  expect(typeof probar).toBe("function");
});
`;

const ej = { id: "ts-x", titulo: "Total" };
const items = generarTs({ ej, unidad: "ts-funciones", tests: TESTS, solucion: SOLUCION });

describe("¿TypeScript lo acepta?", () => {
  test("la línea después de @ts-expect-error es Da error, con el comentario como explicación", () => {
    const error = items.find((i) => i.correcta === 1);
    expect(error).toMatchObject({ tipo: "opcion", subtipo: "ts", unidad: "ts-funciones", opciones: OPCIONES_TS });
    expect(OPCIONES_TS).toEqual(["Compila", "Da error"]);
    expect(error.explicacion).toMatch(/^\*\*Da error\.\*\* El precio debe ser number\./);
    const lineas = error.codigo.texto.split("\n");
    expect(lineas[error.codigo.marcar]).toBe('total([{ nombre: "Leche", precio: "4" }]);');
  });

  test("el contexto trae el interface y solo la firma de la función que usa la línea", () => {
    const error = items.find((i) => i.correcta === 1);
    expect(error.codigo.texto).toBe(
      [
        "export interface Producto {",
        "  nombre: string;",
        "  precio: number;",
        "}",
        "export function total(productos: Producto[]): number { /* ... */ }",
        "",
        'total([{ nombre: "Leche", precio: "4" }]);',
      ].join("\n"),
    );
  });

  test("sin explicación en el comentario, o con nombres que no se muestran, se descarta", () => {
    expect(items.some((i) => i.codigo.texto.includes("nombres(5)"))).toBe(false);
    expect(items.some((i) => i.codigo.texto.includes("nombres(otro)"))).toBe(false);
  });

  test("Compila sale de asignaciones tipadas, con sus declaraciones", () => {
    const compila = items.filter((i) => i.correcta === 0);
    expect(compila).toHaveLength(1);
    const lineas = compila[0].codigo.texto.split("\n");
    expect(["const lista: Producto[] = [pan];", "const suma: number = total(lista);"]).toContain(lineas[compila[0].codigo.marcar]);
    expect(compila[0].codigo.texto).toContain('const pan: Producto = { nombre: "Pan", precio: 1 };');
    expect(compila[0].explicacion).toMatch(/^\*\*Compila\.\*\*/);
  });

  test("nada que dependa de un if (el narrowing no se vería)", () => {
    expect(items.some((i) => i.codigo.texto.includes("const n: string"))).toBe(false);
  });

  test("claves estables ts:<ejercicio>:<línea>", () => {
    for (const i of items) expect(i.clave).toMatch(/^ts:ts-x:\d+$/);
    expect(generarTs({ ej, unidad: "ts-funciones", tests: TESTS, solucion: SOLUCION })).toEqual(items);
  });
});
