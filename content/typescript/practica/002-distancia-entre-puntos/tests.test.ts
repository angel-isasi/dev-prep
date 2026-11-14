import { test, expect, expectTypeOf } from "vitest";
import { distancia, puntoMedio, type Punto } from "./solucion";

test("el triángulo 3-4-5: de [0, 0] a [3, 4] hay 5", () => {
  expect(distancia([0, 0], [3, 4])).toBe(5);
  expect(distancia([1, 1], [4, 5])).toBe(5);
});

test("el mismo punto está a distancia 0", () => {
  expect(distancia([2, 3], [2, 3])).toBe(0);
});

test("funciona con coordenadas negativas y en cualquier orden", () => {
  expect(distancia([-1, -1], [2, 3])).toBe(5);
  expect(distancia([2, 3], [-1, -1])).toBe(5);
  expect(distancia([0, 0], [1, 1])).toBeCloseTo(Math.SQRT2);
});

test("puntoMedio devuelve el punto a mitad de camino", () => {
  expect(puntoMedio([0, 0], [4, 2])).toEqual([2, 1]);
  expect(puntoMedio([-2, 5], [2, -5])).toEqual([0, 0]);
  expect(puntoMedio([1, 1], [2, 2])).toEqual([1.5, 1.5]);
});

test("Punto es una tupla de dos números (lo revisa tsc)", () => {
  expectTypeOf<Punto>().toEqualTypeOf<[number, number]>();
  const tienda: Punto = [10, 20];
  const [x, y] = tienda;
  expectTypeOf(x).toEqualTypeOf<number>();
  expect(x + y).toBe(30);
});

test("puntoMedio devuelve un Punto, no un number[] (lo revisa tsc)", () => {
  const centro = puntoMedio([0, 0], [2, 2]);
  expectTypeOf(centro).toEqualTypeOf<Punto>();
  expect(centro).toHaveLength(2);
});

test("rechaza puntos con 3 números o con texto (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error una tupla Punto tiene exactamente 2 elementos
    distancia([1, 2, 3], [0, 0]);
    // @ts-expect-error "2" es un string, no un number
    distancia([1, "2"], [0, 0]);
    // @ts-expect-error a un Punto le falta la y
    puntoMedio([1], [0, 0]);
  };
  expect(typeof probar).toBe("function");
});
