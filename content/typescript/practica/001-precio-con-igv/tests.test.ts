import { test, expect, expectTypeOf } from "vitest";
import { precioConIgv } from "./solucion";

test("sin tasa usa el IGV de 18%: 100 da 118", () => {
  expect(precioConIgv(100)).toBe(118);
});

test("redondea a 2 decimales: 50.5 da 59.59 y 19.9 da 23.48", () => {
  expect(precioConIgv(50.5)).toBe(59.59);
  expect(precioConIgv(19.9)).toBe(23.48);
});

test("acepta otra tasa: 100 con 0.1 da 110", () => {
  expect(precioConIgv(100, 0.1)).toBe(110);
});

test("un precio 0 da 0", () => {
  expect(precioConIgv(0)).toBe(0);
});

test("devuelve un number (lo revisa tsc)", () => {
  const total: number = precioConIgv(10);
  expect(total).toBe(11.8);
  expectTypeOf(precioConIgv).returns.toEqualTypeOf<number>();
});

test("precio es number y tasa es un number opcional (lo revisa tsc)", () => {
  expectTypeOf(precioConIgv).parameter(0).toEqualTypeOf<number>();
  expectTypeOf(precioConIgv).parameter(1).toEqualTypeOf<number | undefined>();
});

test("no acepta un precio en texto (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error "100" es un string, no un number
    precioConIgv("100");
  };
  expect(typeof probar).toBe("function");
});
