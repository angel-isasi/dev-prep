import { test, expect, expectTypeOf } from "vitest";
import { dividir, parsearJSON, valorO, type Resultado } from "./solucion";

test("dividir con divisor válido devuelve ok: true y el valor", () => {
  expect(dividir(10, 2)).toEqual({ ok: true, valor: 5 });
  expect(dividir(-9, 3)).toEqual({ ok: true, valor: -3 });
});

test("dividir entre cero devuelve el error, sin lanzar", () => {
  expect(dividir(1, 0)).toEqual({ ok: false, error: "No se puede dividir entre cero" });
});

test("parsearJSON con un JSON válido devuelve el valor", () => {
  expect(parsearJSON('{"tema":"oscuro","tamano":16}')).toEqual({ ok: true, valor: { tema: "oscuro", tamano: 16 } });
  expect(parsearJSON("[1,2,3]")).toEqual({ ok: true, valor: [1, 2, 3] });
});

test("parsearJSON con texto inválido devuelve \"JSON inválido\", sin lanzar", () => {
  expect(parsearJSON("{malo")).toEqual({ ok: false, error: "JSON inválido" });
  expect(parsearJSON("")).toEqual({ ok: false, error: "JSON inválido" });
});

test("valorO devuelve el valor o el valor por defecto", () => {
  expect(valorO(dividir(10, 2), 0)).toBe(5);
  expect(valorO(dividir(1, 0), 0)).toBe(0);
  expect(valorO(parsearJSON("{malo"), null)).toBeNull();
});

test("Resultado es una unión discriminada: comprobar ok estrecha el tipo (lo revisa tsc)", () => {
  expectTypeOf(dividir(6, 3)).toEqualTypeOf<Resultado<number>>();
  expectTypeOf<Resultado<number>>().toEqualTypeOf<{ ok: true; valor: number } | { ok: false; error: string }>();

  const r = dividir(6, 3);
  if (r.ok) {
    expectTypeOf(r.valor).toEqualTypeOf<number>();
    const doble: number = r.valor * 2;
    expect(doble).toBe(4);
  } else {
    expectTypeOf(r.error).toEqualTypeOf<string>();
    throw new Error("debería haber salido bien");
  }
});

test("no deja leer valor sin comprobar ok, y valorO exige el mismo tipo (lo revisa tsc)", () => {
  expectTypeOf(valorO(dividir(1, 2), 0)).toEqualTypeOf<number>();
  const probar = () => {
    const r = dividir(6, 3);
    // @ts-expect-error valor solo existe cuando ok es true
    console.log(r.valor);
    // @ts-expect-error el valor por defecto debe ser number, como el resultado
    valorO(dividir(1, 2), "cero");
  };
  expect(typeof probar).toBe("function");
});
