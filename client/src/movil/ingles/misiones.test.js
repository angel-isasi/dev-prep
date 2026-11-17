import { describe, expect, test } from "vitest";
import { contadoresDeLeccion, ligaSemanal, misionesDelDia, premioDeCofre } from "./misiones.js";

describe("misiones diarias", () => {
  test("3 misiones estables por fecha, con su avance y sin hablar si no hay micrófono", () => {
    const a = misionesDelDia("2026-11-17", { inglesXp: 80, inglesAciertos: 3 });
    expect(a).toHaveLength(3);
    expect(misionesDelDia("2026-11-17", {})).toEqual(a.map((m) => ({ ...m, valor: 0, hecha: false })));
    for (let d = 10; d < 30; d++) expect(misionesDelDia(`2026-11-${d}`).some((m) => m.id === "hablar")).toBe(false);
    const xp = misionesDelDia("2026-11-17", { inglesXp: 80 }).find((m) => m.id === "xp");
    if (xp) expect(xp).toMatchObject({ valor: 60, hecha: true });
  });
});

describe("liga contra ti mismo", () => {
  test("compara esta semana con la pasada a la misma altura", () => {
    // 2026-11-17 es martes: lunes 16 y martes 17 contra lunes 9 y martes 10
    const dias = { "2026-11-16": { inglesXp: 50 }, "2026-11-17": { inglesXp: 50 }, "2026-11-09": { inglesXp: 40 }, "2026-11-10": { inglesXp: 40 }, "2026-11-12": { inglesXp: 100 } };
    expect(ligaSemanal(dias, "2026-11-17")).toMatchObject({ estaSemana: 100, pasadaHastaHoy: 80, pasada: 180, diferencia: 25, ganando: true });
  });
});

describe("cofre y contadores", () => {
  test("el cofre prefiere una frase de trabajo de la unidad", () => {
    const items = [
      { unidad: "u", concepto: "frase", en: "a", es: "a" },
      { unidad: "u", concepto: "frase", en: "There's a bug.", es: "Hay un bug.", trabajo: true },
    ];
    expect(premioDeCofre(items, "u").frase).toEqual({ en: "There's a bug.", es: "Hay un bug." });
  });

  test("una lección deja aciertos, nuevos, escuchar y combo", () => {
    const sesion = {
      pasos: [
        { clave: "a", nuevo: true, item: { forma: "escuchar", soloAudio: true } },
        { clave: "b", item: { forma: "hablar" } },
        { clave: "c", item: { extra: true } },
      ],
      notas: { a: "sabia", b: "dude" },
      comboMax: 9,
    };
    expect(contadoresDeLeccion(sesion, { xp: 40, perfecta: false })).toEqual({
      inglesXp: 40, inglesAciertos: 2, inglesPerfectas: 0, inglesCombo8: 1, inglesNuevos: 1, inglesOido: 1, inglesHablar: 1,
    });
  });
});
