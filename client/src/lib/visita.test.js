import { describe, expect, test } from "vitest";
import { crearAlmacenMemoria, progresoDeEjemplo, ES_VISITA } from "./visita.js";
import { resumenDias } from "../../../server/metricas.js";
import { armarRuta } from "../../../server/ruta.js";

const HOY = "2026-11-18";
const ejercicios = Array.from({ length: 60 }, (_, i) => ({ id: `js-${i}`, coleccion: i < 17 ? "javascript/guiados" : "javascript/ejercicios" }));
const unidades = Array.from({ length: 20 }, (_, i) => ({ id: `u${i}` }));
const items = unidades.flatMap((u) => Array.from({ length: 12 }, (_, i) => ({ clave: `quiz:${u.id}:${i}`, unidad: u.id })));
const preguntas = Array.from({ length: 50 }, (_, i) => ({ id: `ent-${i}` }));
const temas = unidades.map((u) => ({ id: u.id, quiz: [1, 2, 3, 4, 5, 6] }));
const ejemplo = () => progresoDeEjemplo({ hoy: HOY, ejercicios, unidades, items, preguntas, temas });

describe("modo visita", () => {
  test("fuera del navegador no está activo", () => {
    expect(ES_VISITA).toBe(false);
  });

  test("el almacén en memoria se comporta como localStorage", () => {
    const a = crearAlmacenMemoria();
    expect(a.getItem("x")).toBeNull();
    a.setItem("x", 5);
    expect(a.getItem("x")).toBe("5");
    a.removeItem("x");
    expect(a.getItem("x")).toBeNull();
  });
});

describe("progreso de ejemplo", () => {
  test("tiene la forma de un respaldo de dev-prep", () => {
    const p = ejemplo();
    expect(p.version).toBe(1);
    expect(p.config).toMatchObject({ nombre: "Angel", metaDiaria: 2 });
    expect(p.config.fechaMeta > HOY).toBe(true);
  });

  test("es siempre el mismo con los mismos datos", () => {
    expect(ejemplo()).toEqual(ejemplo());
  });

  test("muestra una racha en curso y el día de hoy a medias", () => {
    const p = ejemplo();
    const r = resumenDias(p.dias, p.config, HOY);
    expect(r.racha).toBeGreaterThanOrEqual(9);
    expect(r.hoy.hecho).toBeGreaterThan(0);
    expect(r.hoy.cumplioMeta).toBe(false);
  });

  test("deja repasos para hoy: ejercicios, preguntas de lección y tarjetas", () => {
    const p = ejemplo();
    const vencen = (registros, campo = (r) => r.proximo) => Object.values(registros).filter((r) => campo(r) && campo(r) <= HOY).length;
    expect(vencen(p.ejercicios, (r) => r.repaso?.proximo)).toBe(3);
    expect(vencen(p.items)).toBeGreaterThan(0);
    expect(vencen(p.preguntas)).toBeGreaterThan(0);
  });

  test("tiene unidades dominadas, a medias y sin empezar", () => {
    const p = ejemplo();
    const fijados = (u) => items.filter((it) => it.unidad === u && (p.items[it.clave]?.caja ?? 0) >= 3).length;
    expect(fijados("u0")).toBe(12);
    expect(fijados("u13")).toBe(12);
    expect(fijados("u14")).toBeLessThan(12);
    expect(items.filter((it) => it.unidad === "u19").some((it) => p.items[it.clave])).toBe(false);
    expect(p.unidadActual).toBe("u14");
    expect(Object.values(p.ejercicios).filter((e) => e.estado === "resuelto")).toHaveLength(44);
    expect(Object.values(p.ejercicios).filter((e) => e.estado === "en-progreso")).toHaveLength(2);
  });

  test("sirve para armar una ruta con unidades listas y pendientes", () => {
    // Con sus primeras unidades al menos en amarillo, el ejemplo va al día con su ruta
    const mapa = unidades.map((u, i) => ({ id: u.id, titulo: u.id, area: "javascript", valor: i < 8 ? 0.6 : 0.1, estado: i < 8 ? "amarillo" : "rojo" }));
    const r = armarRuta({ hoy: HOY, fechaMeta: ejemplo().config.fechaMeta, inicio: "2026-10-14", unidades: mapa });
    expect(r).toMatchObject({ listas: 8, pendientes: 12 });
    expect(["al-dia", "adelantado"]).toContain(r.estado);
  });
});
