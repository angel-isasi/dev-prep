import { describe, expect, test } from "vitest";
import { estadoJuego, jefeDeLaSemana, minutosBrutos } from "./juego.js";

const CONFIG = { metaDiaria: 2 };
// 2026-11-18 es miércoles

describe("tiempo libre ganado", () => {
  test("cada cosa demostrada suma sus minutos, con máximos por día", () => {
    expect(minutosBrutos({ resueltos: 2, limpios: 1, repasos: 1, lecciones: 5, preguntas: 25 })).toBe(50 + 10 + 10 + 24 + 10);
  });

  test("bloqueado hasta cumplir la meta; al cumplir, se puede jugar lo ganado", () => {
    const dias = { "2026-11-17": { resueltos: 2 }, "2026-11-18": { resueltos: 1 } };
    const antes = estadoJuego(dias, CONFIG, "2026-11-18");
    expect(antes).toMatchObject({ bloqueado: true, disponible: 0, faltaParaDesbloquear: 25 }); // en puntos
    const despues = estadoJuego({ ...dias, "2026-11-18": { resueltos: 2 } }, CONFIG, "2026-11-18");
    expect(despues).toMatchObject({ bloqueado: false, ganado: 50, disponible: 50, restante: 50 });
  });

  test("si ayer no cumpliste, hoy ganas la mitad", () => {
    const dias = { "2026-11-16": { resueltos: 2 }, "2026-11-17": { resueltos: 0 }, "2026-11-18": { resueltos: 2 } };
    expect(estadoJuego(dias, CONFIG, "2026-11-18")).toMatchObject({ mitad: true, ganado: 25 });
  });

  test("tope de 120 al día", () => {
    const dias = { "2026-11-17": { resueltos: 2 }, "2026-11-18": { resueltos: 8 } };
    expect(estadoJuego(dias, CONFIG, "2026-11-18").ganado).toBe(120);
  });

  test("jugar de más pasa a deuda y se descuenta al día siguiente", () => {
    const dias = {
      "2026-11-16": { resueltos: 2 },
      "2026-11-17": { resueltos: 2, juego: 80 * 60 }, // ganó 50, jugó 80: debe 30
      "2026-11-18": { resueltos: 2 },
    };
    expect(estadoJuego(dias, CONFIG, "2026-11-18")).toMatchObject({ deuda: 30, pagado: 30, disponible: 20 });
  });

  test("jugar sin haber cumplido también es deuda", () => {
    const dias = { "2026-11-16": { resueltos: 2 }, "2026-11-17": { resueltos: 0, juego: 40 * 60 }, "2026-11-18": { resueltos: 4 } };
    // ayer no cumplió: hoy gana la mitad de 100 = 50, menos 40 de deuda
    expect(estadoJuego(dias, CONFIG, "2026-11-18")).toMatchObject({ ganado: 50, deuda: 40, disponible: 10 });
  });

  test("semana perfecta: el sábado el tope sube a 180", () => {
    const dias = {};
    for (const f of ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"]) dias[f] = { resueltos: 2 };
    dias["2026-11-21"] = { resueltos: 10 };
    expect(estadoJuego(dias, CONFIG, "2026-11-21")).toMatchObject({ tope: 180, ganado: 180, finDeSemanaLargo: true });
  });

  test("jefe de la semana: el mismo toda la semana y solo retos sin resolver", () => {
    const ejercicios = [
      { id: "r1", coleccion: "javascript/retos", nivel: 3 },
      { id: "r2", coleccion: "react/retos", nivel: 2 },
      { id: "e1", coleccion: "javascript/ejercicios", nivel: 3 },
    ];
    const lunes = jefeDeLaSemana(ejercicios, {}, "2026-11-16");
    expect(["r1", "r2"]).toContain(lunes.id);
    expect(jefeDeLaSemana(ejercicios, {}, "2026-11-22").id).toBe(lunes.id);
    expect(jefeDeLaSemana(ejercicios, { r1: { estado: "resuelto" }, r2: { estado: "resuelto" } }, "2026-11-16")).toBeNull();
  });
});

test("el primer día no se castiga con la mitad", () => {
  expect(estadoJuego({ "2026-11-18": { resueltos: 2 } }, { metaDiaria: 2 }, "2026-11-18")).toMatchObject({ mitad: false, ganado: 50 });
});
