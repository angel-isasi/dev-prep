import { describe, expect, test } from "vitest";
import { decidirAvisos, horaHabitual, horaLocal } from "./avisos.js";

// Lima es UTC-5: las 19:00 de Lima del miércoles 18 son las 00:00 UTC del jueves 19.
const enLima = (fecha, hora) => new Date(`${fecha}T${String(hora).padStart(2, "0")}:05:00-05:00`);
const doc = (extra = {}) => ({ dispositivo: "laptop", doc: { version: 1, config: { metaDiaria: 2, topeDeuda: 6 }, dias: {}, ...extra } });

describe("avisos", () => {
  test("la hora local sale de la zona horaria, no del servidor (la Lambda corre en UTC)", () => {
    expect(horaLocal(enLima("2026-11-18", 19))).toMatchObject({ fecha: "2026-11-18", hora: 19 });
  });

  test("recordatorio a tu hora habitual si hoy no hiciste nada; nada si ya estudiaste", () => {
    const sinNada = decidirAvisos([doc({ dias: { "2026-11-17": { resueltos: 2 } } })], enLima("2026-11-18", 19));
    expect(sinNada.avisos.map((a) => a.tipo)).toEqual(["recordatorio"]);
    expect(sinNada.avisos[0].titulo).toMatch(/racha de 1 día/);
    const conAlgo = decidirAvisos([doc({ dias: { "2026-11-18": { preguntas: 3 } } })], enLima("2026-11-18", 19));
    expect(conAlgo.avisos).toEqual([]);
  });

  test("la hora habitual se calcula de tu actividad (con un celular que estudia a las 7 de la mañana)", () => {
    const preguntas = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`p${i}`, { en: `2026-11-1${i % 7}T07:20:00-05:00` }]));
    expect(horaHabitual({ preguntas }, "2026-11-18")).toBe(7);
  });

  test("última llamada a las 21:00 si la racha está en riesgo; no se repite y hay máximo 2 al día", () => {
    const docs = [doc({ dias: { "2026-11-16": { resueltos: 2 }, "2026-11-17": { resueltos: 2 }, "2026-11-18": { resueltos: 1 } } })];
    const r = decidirAvisos(docs, enLima("2026-11-18", 21));
    expect(r.avisos.map((a) => a.tipo)).toEqual(["ultima-llamada"]);
    expect(decidirAvisos(docs, enLima("2026-11-18", 21), r.estado).avisos).toEqual([]);
    expect(decidirAvisos(docs, enLima("2026-11-18", 21), { fecha: "2026-11-18", enviados: ["a", "b"] }).avisos).toEqual([]);
  });

  test("en una pausa de exámenes o con los avisos apagados no avisa", () => {
    const pausa = { pausas: { lista: [{ desde: "2026-11-17", hasta: "2026-11-20" }], en: "2026-11-15T10:00:00-05:00" } };
    expect(decidirAvisos([doc({ ajustes: pausa })], enLima("2026-11-18", 19)).avisos).toEqual([]);
    const apagados = { avisos: { activos: false, en: "2026-11-15T10:00:00-05:00" } };
    expect(decidirAvisos([doc({ ajustes: apagados })], enLima("2026-11-18", 19)).avisos).toEqual([]);
  });

  test("domingo a las 20:00: resumen de la semana", () => {
    const r = decidirAvisos([doc({ dias: { "2026-11-16": { resueltos: 3 }, "2026-11-22": { resueltos: 1 } } })], enLima("2026-11-22", 20));
    expect(r.avisos.map((a) => a.tipo)).toContain("resumen");
    expect(r.avisos.find((a) => a.tipo === "resumen").cuerpo).toMatch(/^4 ejercicios/);
  });
});

describe("aviso de ofertas", () => {
  const oferta = (id, puntaje) => ({ id, titulo: "Frontend Junior", empresa: "Acme", puntaje });

  test("a las 11:00 avisa de las ofertas nuevas, con la mejor en el texto", () => {
    const r = decidirAvisos([doc()], enLima("2026-11-18", 11), {}, { ofertasNuevas: [oferta("a", 72), oferta("b", 61)] });
    expect(r.avisos.map((a) => a.tipo)).toEqual(["ofertas"]);
    expect(r.avisos[0].titulo).toBe("2 ofertas nuevas para ti");
    expect(r.avisos[0].cuerpo).toContain("Frontend Junior en Acme (72/100)");
  });

  test("a otra hora, sin ofertas o en una pausa, no avisa", () => {
    expect(decidirAvisos([doc()], enLima("2026-11-18", 15), {}, { ofertasNuevas: [oferta("a", 72)] }).avisos).toEqual([]);
    expect(decidirAvisos([doc()], enLima("2026-11-18", 11), {}, { ofertasNuevas: [] }).avisos).toEqual([]);
    const pausa = { pausas: { lista: [{ desde: "2026-11-17", hasta: "2026-11-20" }], en: "2026-11-15T10:00:00-05:00" } };
    expect(decidirAvisos([doc({ ajustes: pausa })], enLima("2026-11-18", 11), {}, { ofertasNuevas: [oferta("a", 72)] }).avisos).toEqual([]);
  });
});
