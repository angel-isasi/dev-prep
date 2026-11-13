import { describe, test, expect } from "vitest";
import { resumenDias, preparacion, ritmo, semana, calendario, diasEntre, dominio } from "./metricas.js";

const CONFIG = { metaDiaria: 2, topeDeuda: 6 };

describe("resumenDias", () => {
  test("primer día de uso: sin deuda ni racha", () => {
    const r = resumenDias({}, CONFIG, "2026-11-13");
    expect(r.hoy).toEqual({ hecho: 0, objetivo: 2, deuda: 0, cumplio: false });
    expect(r.racha).toBe(0);
    expect(r.ayer).toBeNull();
  });

  test("racha de días cumpliendo la meta, contando hoy", () => {
    const dias = {
      "2026-11-11": { resueltos: 2 },
      "2026-11-12": { resueltos: 1, repasos: 1 },
      "2026-11-13": { resueltos: 3 },
    };
    expect(resumenDias(dias, CONFIG, "2026-11-13").racha).toBe(3);
  });

  test("si hoy aún no cumples, la racha viene de ayer", () => {
    const dias = { "2026-11-11": { resueltos: 2 }, "2026-11-12": { resueltos: 2 }, "2026-11-13": { resueltos: 1 } };
    const r = resumenDias(dias, CONFIG, "2026-11-13");
    expect(r.racha).toBe(2);
    expect(r.hoy.cumplio).toBe(false);
  });

  test("lo que no hiciste se suma a hoy como deuda", () => {
    const dias = { "2026-11-11": { resueltos: 2 }, "2026-11-12": { resueltos: 0, segundos: 60 } };
    const r = resumenDias(dias, CONFIG, "2026-11-13");
    expect(r.hoy.deuda).toBe(2);
    expect(r.hoy.objetivo).toBe(4);
    expect(r.ayer.cumplio).toBe(false);
  });

  test("la deuda tiene tope", () => {
    const dias = { "2026-11-01": { resueltos: 2 } };
    expect(resumenDias(dias, CONFIG, "2026-11-13").hoy.deuda).toBe(6);
  });
});

describe("preparacion", () => {
  const ejercicios = [
    { id: "a", tema: "arrays" },
    { id: "b", tema: "arrays" },
  ];

  test("0 % si no resolviste nada", () => {
    expect(preparacion(ejercicios, {}, "2026-11-13").total).toBe(0);
  });

  test("resolver uno de dos sin ayuda da 50 %", () => {
    const r = preparacion(ejercicios, { a: { estado: "resuelto", pistasVistas: 0 } }, "2026-11-13");
    expect(r.total).toBe(50);
    expect(r.porTema[0]).toEqual({ tema: "arrays", total: 2, resueltos: 1, porcentaje: 50 });
  });

  test("con las 3 pistas vale menos y con la solución vista no vale", () => {
    expect(dominio({ estado: "resuelto", pistasVistas: 3 }, "2026-11-13")).toBe(0.6);
    expect(dominio({ estado: "resuelto", pistasVistas: 0, vioSolucion: true }, "2026-11-13")).toBe(0);
  });

  test("un repaso vencido baja el dominio", () => {
    const r = { estado: "resuelto", pistasVistas: 0, repaso: { caja: 2, proximo: "2026-11-10" } };
    expect(dominio(r, "2026-11-13")).toBe(0.8);
  });
});

describe("ritmo", () => {
  test("al día si tu promedio alcanza lo que necesitas", () => {
    const dias = { "2026-11-13": { resueltos: 7 } };
    const r = ritmo({ fechaMeta: "2026-12-13", hoy: "2026-11-13", totalEjercicios: 30, resueltos: 0, dias });
    expect(r.diasRestantes).toBe(30);
    expect(r.necesarioPorDia).toBe(1);
    expect(r.promedioSemana).toBe(1);
    expect(r.estado).toBe("al-dia");
  });

  test("atrasado si vas más lento", () => {
    const r = ritmo({ fechaMeta: "2026-11-23", hoy: "2026-11-13", totalEjercicios: 50, resueltos: 0, dias: {} });
    expect(r.estado).toBe("atrasado");
  });
});

describe("semana y calendario", () => {
  test("la semana va de lunes a hoy", () => {
    // 2026-11-13 es viernes; el lunes es 2026-11-09
    const dias = {
      "2026-11-08": { resueltos: 9, preparacion: 10 },
      "2026-11-09": { resueltos: 2, segundos: 600 },
      "2026-11-13": { resueltos: 1, repasos: 1 },
    };
    expect(semana(dias, "2026-11-13", 15.5)).toEqual({
      desde: "2026-11-09",
      resueltos: 3,
      repasos: 1,
      minutos: 10,
      subioPreparacion: 5.5,
    });
  });

  test("el calendario termina hoy y empieza un lunes", () => {
    const celdas = calendario({ "2026-11-13": { resueltos: 3 } }, "2026-11-13", 2);
    expect(celdas[0].fecha).toBe("2026-11-02");
    expect(celdas.at(-1)).toEqual({ fecha: "2026-11-13", hecho: 3, minutos: 0, nivel: 3 });
  });

  test("diasEntre", () => {
    expect(diasEntre("2026-11-13", "2027-03-01")).toBe(108);
  });
});
