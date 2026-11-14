import { test, expect, expectTypeOf } from "vitest";
import { formatearValor, type ValorCelda } from "./solucion";

test("null se muestra como \"Sin dato\"", () => {
  expect(formatearValor(null)).toBe("Sin dato");
});

test("los booleanos se muestran como Sí o No (false no es \"Sin dato\")", () => {
  expect(formatearValor(true)).toBe("Sí");
  expect(formatearValor(false)).toBe("No");
});

test("los números van con 2 decimales, incluido el 0", () => {
  expect(formatearValor(12.5)).toBe("12.50");
  expect(formatearValor(0)).toBe("0.00");
  expect(formatearValor(-3)).toBe("-3.00");
});

test("los textos se limpian; si quedan vacíos son \"Sin dato\"", () => {
  expect(formatearValor("  Lima ")).toBe("Lima");
  expect(formatearValor("")).toBe("Sin dato");
  expect(formatearValor("   ")).toBe("Sin dato");
});

test("un texto con un número se deja como texto", () => {
  expect(formatearValor("12.5")).toBe("12.5");
});

test("ValorCelda es string | number | boolean | null (lo revisa tsc)", () => {
  expectTypeOf<ValorCelda>().toEqualTypeOf<string | number | boolean | null>();
  expectTypeOf(formatearValor).returns.toEqualTypeOf<string>();
  const fila: ValorCelda[] = ["Ana", 25, true, null];
  expect(fila.map(formatearValor)).toEqual(["Ana", "25.00", "Sí", "Sin dato"]);
});

test("no acepta undefined, objetos ni arrays (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error undefined no está en la unión
    formatearValor(undefined);
    // @ts-expect-error un objeto no es un ValorCelda
    formatearValor({ a: 1 });
    // @ts-expect-error un array no es un ValorCelda
    formatearValor([1, 2]);
  };
  expect(typeof probar).toBe("function");
});
