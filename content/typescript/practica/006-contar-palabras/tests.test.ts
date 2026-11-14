import { test, expect, expectTypeOf } from "vitest";
import { contarPalabras, masFrecuente } from "./solucion";

test("cuenta cuántas veces aparece cada palabra", () => {
  expect(contarPalabras("hola mundo hola")).toEqual({ hola: 2, mundo: 1 });
});

test("no distingue mayúsculas y quita los signos de puntuación", () => {
  expect(contarPalabras("Muy bueno. ¡Muy rápido!   Bueno")).toEqual({ muy: 2, bueno: 2, rápido: 1 });
  expect(contarPalabras("¿Llega hoy? Sí, llega: hoy.")).toEqual({ llega: 2, hoy: 2, sí: 1 });
});

test("ignora espacios de sobra y saltos de línea; un texto vacío da {}", () => {
  expect(contarPalabras("  cómodo \n\n cómodo  ")).toEqual({ cómodo: 2 });
  expect(contarPalabras("")).toEqual({});
  expect(contarPalabras("   ")).toEqual({});
});

test("masFrecuente devuelve la palabra con más apariciones", () => {
  expect(masFrecuente({ hola: 2, mundo: 1 })).toBe("hola");
  expect(masFrecuente(contarPalabras("barato lento barato rápido barato"))).toBe("barato");
});

test("masFrecuente: en un empate gana la primera; sin palabras da null", () => {
  expect(masFrecuente({ muy: 2, bueno: 2 })).toBe("muy");
  expect(masFrecuente({})).toBeNull();
});

test("devuelve un Record<string, number> y string | null (lo revisa tsc)", () => {
  const conteo = contarPalabras("hola hola");
  expectTypeOf(conteo).toEqualTypeOf<Record<string, number>>();
  expectTypeOf(conteo).toEqualTypeOf<{ [palabra: string]: number }>();
  expectTypeOf(masFrecuente).parameter(0).toEqualTypeOf<Record<string, number>>();
  expectTypeOf(masFrecuente).returns.toEqualTypeOf<string | null>();
  // Cualquier clave de texto se puede leer y su valor es un number:
  const veces: number = conteo["hola"];
  expect(veces).toBe(2);
});

test("los valores del conteo solo pueden ser números (lo revisa tsc)", () => {
  const conteo = contarPalabras("hola");
  const probar = () => {
    // @ts-expect-error el valor debe ser number, no string
    conteo["hola"] = "dos";
    // @ts-expect-error masFrecuente puede devolver null: no es un string seguro
    const palabra: string = masFrecuente(conteo);
    return palabra;
  };
  expect(typeof probar).toBe("function");
});
