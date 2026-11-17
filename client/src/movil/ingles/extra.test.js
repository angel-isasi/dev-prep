import { describe, expect, test } from "vitest";
import { extraDesdeRegistros, registrosDesdeViejo } from "./extra.js";

describe("lo extra de inglés en registros sueltos", () => {
  test("arma cofres, legendarias, historias y los valores sueltos", () => {
    const extra = extraDesdeRegistros({
      "cofre:en-basico-01": { v: "2026-11-17" },
      "legendaria:en-basico-01": { v: "2026-11-18" },
      "historia:en-basico-01-h01": { v: "2026-11-17" },
      cofreDiario: { v: "2026-11-17" },
      vidas: { v: true },
      parejasRecord: { v: 12 },
      examen: { v: { hasta: "en-intermedio-03" } },
      otraCosa: { v: 1 },
    });
    expect(extra).toEqual({
      cofres: { "en-basico-01": "2026-11-17" },
      legendarias: { "en-basico-01": "2026-11-18" },
      historias: { "en-basico-01-h01": "2026-11-17" },
      cofreDiario: "2026-11-17",
      vidas: true,
      parejasRecord: 12,
      examen: { hasta: "en-intermedio-03" },
    });
  });

  test("el formato viejo (un solo ajuste) pasa a registros sin perder nada", () => {
    const viejo = { cofres: { u1: "d1" }, legendarias: { u1: "d2" }, historias: { h1: "d3" }, cofreDiario: "d4", vidas: false, parejasRecord: 7 };
    const pares = registrosDesdeViejo(viejo);
    const registros = Object.fromEntries(pares.map(([id, v]) => [id, { v }]));
    expect(extraDesdeRegistros(registros)).toMatchObject(viejo);
  });
});
