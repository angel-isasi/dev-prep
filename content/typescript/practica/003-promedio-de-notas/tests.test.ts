import { test, expect, expectTypeOf } from "vitest";
import { promedio } from "./solucion";

test("promedia varias notas: [14, 16, 18] da 16", () => {
  expect(promedio([14, 16, 18])).toBe(16);
});

test("no redondea: [11, 12] da 11.5 y [13, 14, 14] da 13.67 aprox.", () => {
  expect(promedio([11, 12])).toBe(11.5);
  expect(promedio([13, 14, 14])).toBeCloseTo(13.667, 3);
});

test("con una sola nota, el promedio es esa nota", () => {
  expect(promedio([20])).toBe(20);
});

test("sin notas devuelve null, pero con ceros devuelve 0", () => {
  expect(promedio([])).toBeNull();
  expect(promedio([0, 0, 0])).toBe(0);
});

test("no modifica el array original", () => {
  const notas = [18, 12, 15];
  promedio(notas);
  expect(notas).toEqual([18, 12, 15]);
});

test("recibe number[] y devuelve number | null (lo revisa tsc)", () => {
  expectTypeOf(promedio).parameter(0).toEqualTypeOf<number[]>();
  expectTypeOf(promedio).returns.toEqualTypeOf<number | null>();

  const p = promedio([10, 20]);
  // Hay que resolver el null antes de usarlo como número:
  const paraMostrar: number = p ?? 0;
  expect(paraMostrar).toBe(15);
});

test("no acepta notas en texto ni usar el resultado sin revisar el null (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error las notas deben ser number, no string
    promedio(["14", "16"]);
    // @ts-expect-error el resultado puede ser null, no se asigna directo a un number
    const n: number = promedio([10]);
    return n;
  };
  expect(typeof probar).toBe("function");
});
