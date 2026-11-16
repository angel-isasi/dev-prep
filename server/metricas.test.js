import { describe, test, expect } from "vitest";
import { resumenDias, preparacion, ritmo, semana, calendario, diasEntre, dominio, metaDelDia, diaSemana } from "./metricas.js";

const CONFIG = { metaDiaria: 2, topeDeuda: 6 };

describe("resumenDias", () => {
  test("primer día de uso: sin deuda ni racha", () => {
    const r = resumenDias({}, CONFIG, "2026-11-13");
    expect(r.hoy).toMatchObject({ hecho: 0, objetivo: 2, deuda: 0, cumplio: false });
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
  test("al día si tu promedio de 7 días alcanza lo que necesitas", () => {
    const dias = {};
    for (let d = 7; d <= 13; d++) dias[`2026-11-${String(d).padStart(2, "0")}`] = { resueltos: 1 };
    const r = ritmo({ fechaMeta: "2026-12-13", hoy: "2026-11-13", totalEjercicios: 30, resueltos: 0, dias });
    expect(r.diasRestantes).toBe(30);
    expect(r.necesarioPorDia).toBe(1);
    expect(r.promedioSemana).toBe(1);
    expect(r.estado).toBe("al-dia");
  });

  test("atrasado si vas más lento y ya llevas varios días", () => {
    const dias = { "2026-11-05": { segundos: 600 } };
    const r = ritmo({ fechaMeta: "2026-11-23", hoy: "2026-11-13", totalEjercicios: 50, resueltos: 0, dias });
    expect(r.diasHistoria).toBe(7);
    expect(r.estado).toBe("atrasado");
  });

  test("los primeros días no hay veredicto: empezando", () => {
    const dias = { "2026-11-13": { segundos: 600 } };
    const r = ritmo({ fechaMeta: "2027-03-01", hoy: "2026-11-14", totalEjercicios: 257, resueltos: 0, dias });
    expect(r.diasHistoria).toBe(2);
    expect(r.estado).toBe("empezando");
  });

  test("el promedio se saca solo con los días que llevas", () => {
    const dias = { "2026-11-12": { resueltos: 2 }, "2026-11-13": { resueltos: 2 } };
    const r = ritmo({ fechaMeta: "2027-03-01", hoy: "2026-11-13", totalEjercicios: 257, resueltos: 4, dias });
    expect(r.promedioSemana).toBe(2);
  });

  test("sin ninguna actividad, cuenta desde hoy", () => {
    const r = ritmo({ fechaMeta: "2027-03-01", hoy: "2026-11-13", totalEjercicios: 257, resueltos: 0, dias: {} });
    expect(r.diasHistoria).toBe(1);
    expect(r.estado).toBe("empezando");
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
      dias: [
        { fecha: "2026-11-09", hecho: 2, minutos: 10, futuro: false },
        { fecha: "2026-11-10", hecho: 0, minutos: 0, futuro: false },
        { fecha: "2026-11-11", hecho: 0, minutos: 0, futuro: false },
        { fecha: "2026-11-12", hecho: 0, minutos: 0, futuro: false },
        { fecha: "2026-11-13", hecho: 2, minutos: 0, futuro: false },
        { fecha: "2026-11-14", hecho: 0, minutos: 0, futuro: true },
        { fecha: "2026-11-15", hecho: 0, minutos: 0, futuro: true },
      ],
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

describe("día salvado, pausas y horario", () => {
  // 2026-11-16 es lunes
  test("un día con algo hecho pero sin llegar a la meta no rompe la racha (máximo 2 por semana)", () => {
    const dias = {
      "2026-11-16": { resueltos: 2 },
      "2026-11-17": { resueltos: 1 }, // salvado
      "2026-11-18": { resueltos: 2 },
      "2026-11-19": { resueltos: 1 }, // salvado (segundo)
      "2026-11-20": { resueltos: 2 },
    };
    const r = resumenDias(dias, CONFIG, "2026-11-21");
    expect(r.racha).toBe(5);
    expect(r.salvados).toEqual({ semana: 2, maximo: 2 });
    expect(r.hoy.deuda).toBeGreaterThan(0); // la deuda igual suma
  });

  test("el tercer día flojo de la semana sí rompe la racha", () => {
    const dias = {
      "2026-11-16": { resueltos: 1 },
      "2026-11-17": { resueltos: 1 },
      "2026-11-18": { resueltos: 1 },
      "2026-11-19": { resueltos: 2 },
    };
    expect(resumenDias(dias, CONFIG, "2026-11-20").racha).toBe(1);
  });

  test("un día sin nada hecho no se salva", () => {
    const dias = { "2026-11-16": { resueltos: 2 }, "2026-11-17": { segundos: 30 }, "2026-11-18": { resueltos: 2 } };
    expect(resumenDias(dias, CONFIG, "2026-11-18").racha).toBe(1);
  });

  test("hoy se acredita como salvado recién al cerrar el día", () => {
    const dias = { "2026-11-16": { resueltos: 2 }, "2026-11-17": { resueltos: 1 } };
    const r = resumenDias(dias, CONFIG, "2026-11-17");
    expect(r.racha).toBe(1);
    expect(r.hoy.salvable).toBe(true);
  });

  test("en una pausa (exámenes) no se suma deuda ni se rompe la racha", () => {
    const dias = { "2026-11-16": { resueltos: 2 }, "2026-11-20": { resueltos: 2 } };
    const r = resumenDias(dias, CONFIG, "2026-11-20", { pausas: [{ desde: "2026-11-17", hasta: "2026-11-19" }] });
    expect(r.racha).toBe(2);
    expect(r.hoy.deuda).toBe(0);
  });

  test("con horario, la meta se reparte por día sin cambiar el total de la semana", () => {
    const horario = { lun: "poco", mar: "normal", mie: "normal", jue: "normal", vie: "poco", sab: "mucho", dom: "libre" };
    expect(diaSemana("2026-11-16")).toBe(0);
    const metas = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22"].map((f) => metaDelDia(f, 2, horario));
    expect(metas).toEqual([1, 3, 3, 3, 1, 4, 0]);
    const dias = { "2026-11-22": { resueltos: 0 }, "2026-11-21": { resueltos: 4 } };
    expect(resumenDias(dias, CONFIG, "2026-11-23", { horario }).ayer.estado).not.toBe("fallo");
  });
});
