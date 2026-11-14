import { test, expect, expectTypeOf } from "vitest";
import { aplicarATodos, conDescuento, type Transformacion } from "./solucion";

test("aplica la función a cada precio", () => {
  expect(aplicarATodos([10, 20, 30], (p) => p * 2)).toEqual([20, 40, 60]);
});

test("con un arreglo vacío devuelve []", () => {
  expect(aplicarATodos([], (p) => p + 1)).toEqual([]);
});

test("no modifica el arreglo original", () => {
  const precios = [5, 10];
  const resultado = aplicarATodos(precios, (p) => p + 1);
  expect(precios).toEqual([5, 10]);
  expect(resultado).not.toBe(precios);
});

test("conDescuento devuelve una función que quita el porcentaje", () => {
  const menos10 = conDescuento(10);
  expect(typeof menos10).toBe("function");
  expect(menos10(100)).toBe(90);
  expect(menos10(50)).toBe(45);
});

test("se combinan: aplicarATodos con conDescuento(20)", () => {
  expect(aplicarATodos([100, 50], conDescuento(20))).toEqual([80, 40]);
});

test("Transformacion es (precio: number) => number (lo revisa tsc)", () => {
  expectTypeOf<Transformacion>().toEqualTypeOf<(precio: number) => number>();
  expectTypeOf(conDescuento(15)).toEqualTypeOf<(precio: number) => number>();
  const total: number[] = aplicarATodos([1, 2], conDescuento(0));
  expect(total).toEqual([1, 2]);
});

test("rechaza callbacks que reciben o devuelven texto (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error el callback debe recibir un number, no un string
    aplicarATodos([1, 2], (p: string) => p.length);
    // @ts-expect-error el callback debe devolver un number, no un string
    aplicarATodos([1, 2], (p) => "S/ " + p);
  };
  expect(typeof probar).toBe("function");
});
