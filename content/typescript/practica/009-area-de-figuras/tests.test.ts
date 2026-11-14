import { test, expect, expectTypeOf } from "vitest";
import { area, areaTotal, type Figura } from "./solucion";

test("área de un círculo: radio 1 da 3.14 y radio 2 da 12.57", () => {
  expect(area({ tipo: "circulo", radio: 1 })).toBe(3.14);
  expect(area({ tipo: "circulo", radio: 2 })).toBe(12.57);
});

test("área de un rectángulo: 4 por 2.5 da 10", () => {
  expect(area({ tipo: "rectangulo", ancho: 4, alto: 2.5 })).toBe(10);
});

test("área de un triángulo: base 3 y altura 5 da 7.5", () => {
  expect(area({ tipo: "triangulo", base: 3, altura: 5 })).toBe(7.5);
});

test("areaTotal suma todas las figuras", () => {
  const banner: Figura[] = [
    { tipo: "rectangulo", ancho: 2, alto: 3 },
    { tipo: "triangulo", base: 4, altura: 2 },
    { tipo: "circulo", radio: 1 },
  ];
  expect(areaTotal(banner)).toBe(13.14);
});

test("areaTotal de un banner vacío es 0", () => {
  expect(areaTotal([])).toBe(0);
});

test("Figura es una unión discriminada por tipo (lo revisa tsc)", () => {
  expectTypeOf<Figura["tipo"]>().toEqualTypeOf<"circulo" | "rectangulo" | "triangulo">();
  expectTypeOf<Extract<Figura, { tipo: "circulo" }>>().toEqualTypeOf<{ tipo: "circulo"; radio: number }>();
  expectTypeOf(area).returns.toEqualTypeOf<number>();
  const logo: Figura = { tipo: "circulo", radio: 3 };
  expect(area(logo)).toBe(28.27);
});

test("rechaza figuras mal formadas (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error un círculo tiene radio, no ancho
    area({ tipo: "circulo", ancho: 2 });
    // @ts-expect-error "hexagono" no es un tipo de figura
    area({ tipo: "hexagono", lado: 2 });
    // @ts-expect-error a un rectángulo le falta el alto
    areaTotal([{ tipo: "rectangulo", ancho: 2 }]);
  };
  expect(typeof probar).toBe("function");
});
