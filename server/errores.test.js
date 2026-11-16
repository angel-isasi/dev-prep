import { describe, expect, test } from "vitest";
import { categoriasDeResultado, erroresFrecuentes, explicarError } from "./errores.js";

describe("errores frecuentes", () => {
  test("clasifica los mensajes de los tests y no repite categorías en una corrida", () => {
    const r = {
      pasan: 0,
      total: 3,
      casos: [
        { ok: false, mensaje: "expected undefined to deeply equal [ 2, 4 ]" },
        { ok: false, mensaje: "expected undefined to be 3" },
        { ok: false, mensaje: "Cannot read properties of undefined (reading 'length')" },
      ],
    };
    expect(categoriasDeResultado(r)).toEqual(["sin-return", "undefined-null"]);
  });

  test("suma por categoría en todos los días, de mayor a menor", () => {
    const dias = { "2026-11-14": { "err:sin-return": 2, resueltos: 1 }, "2026-11-15": { "err:sin-return": 1, "err:nan": 1 } };
    expect(erroresFrecuentes(dias)).toEqual([
      { categoria: "sin-return", nombre: "Olvidar el return", veces: 3 },
      { categoria: "nan", nombre: "Operaciones que dan NaN", veces: 1 },
    ]);
  });

  test("las pistas siguen igual que antes", () => {
    expect(explicarError("TypeError: x.map is not a function")).toMatch(/no es una función/);
    expect(explicarError("expected [ 1 ] to deeply equal [ 2 ]")).toBeNull();
  });
});
