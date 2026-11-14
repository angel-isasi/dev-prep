import { test, expect, expectTypeOf } from "vitest";
import { primero, ultimo } from "./solucion";

interface Mensaje {
  autor: string;
  texto: string;
}

const mensajes: Mensaje[] = [
  { autor: "Ana", texto: "Hola" },
  { autor: "Luis", texto: "¿Vamos al cine?" },
  { autor: "Ana", texto: "Dale" },
];

test("primero devuelve el primer elemento", () => {
  expect(primero([10, 20, 30])).toBe(10);
  expect(primero(["a"])).toBe("a");
});

test("ultimo devuelve el último elemento", () => {
  expect(ultimo([10, 20, 30])).toBe(30);
  expect(ultimo(["hola", "chau"])).toBe("chau");
});

test("con una lista vacía las dos devuelven undefined", () => {
  expect(primero([])).toBeUndefined();
  expect(ultimo([])).toBeUndefined();
});

test("devuelven el mismo objeto, no una copia, y no cambian la lista", () => {
  expect(primero(mensajes)).toBe(mensajes[0]);
  expect(ultimo(mensajes)).toBe(mensajes[2]);
  expect(mensajes).toHaveLength(3);
});

test("el tipo se adapta a la lista: number, string, Mensaje (lo revisa tsc)", () => {
  expectTypeOf(primero([1, 2, 3])).toEqualTypeOf<number | undefined>();
  expectTypeOf(ultimo(["a", "b"])).toEqualTypeOf<string | undefined>();
  expectTypeOf(ultimo(mensajes)).toEqualTypeOf<Mensaje | undefined>();
  expect(ultimo(mensajes)?.texto).toBe("Dale");
});

test("obliga a comprobar undefined antes de usar el resultado (lo revisa tsc)", () => {
  const probar = () => {
    const m = ultimo(mensajes);
    // @ts-expect-error m puede ser undefined: hay que comprobarlo antes
    return m.texto;
  };
  const m = primero(mensajes);
  const texto: string = m ? m.texto : "Sin mensajes";
  expect(texto).toBe("Hola");
  expect(typeof probar).toBe("function");
});
