import { describe, expect, it } from "vitest";
import { armarLeccion, crearSesion, responder } from "./motor.js";
import { despuesDe, empaquetar, MAXIMO_PARTE, nombreDe, planUnidad, pruebaAprobada } from "./plan.js";

const item = (clave, fuente, extra = {}) => ({ clave, unidad: "u1", tipo: "opcion", subtipo: "quiz", fuente, ...extra });
const tema = { tipo: "tema", id: "u1", titulo: "Variables" };
const metodo = (id) => ({ tipo: "referencia", id, titulo: `String.prototype.${id}()` });
const ejercicio = (id) => ({ tipo: "ejercicio", id, titulo: `Ejercicio ${id}` });

// 9 del tema, 12 de ejercicios (3 ejercicios de 4) y 3 métodos de 5 preguntas
const items = [
  ...Array.from({ length: 9 }, (_, i) => item(`quiz:${i}`, tema)),
  ...["a", "b", "c"].flatMap((e) => Array.from({ length: 4 }, (_, i) => item(`ej:${e}:${i}`, ejercicio(e), { subtipo: "hueco" }))),
  ...["slice", "split", "trim"].flatMap((m) => Array.from({ length: 5 }, (_, i) => item(`ref:${m}:${i}`, metodo(m), { subtipo: "devuelve" }))),
  item("otra", tema, { unidad: "u2" }),
];

describe("empaquetar", () => {
  it("no parte los grupos chicos y no pasa del máximo", () => {
    const partes = empaquetar(items.filter((it) => it.fuente.tipo === "referencia"));
    expect(partes.map((p) => p.length)).toEqual([10, 5]);
    expect(partes.every((p) => p.length <= MAXIMO_PARTE)).toBe(true);
    expect(new Set(partes[0].map((it) => it.fuente.id))).toEqual(new Set(["slice", "split"]));
  });

  it("corta un grupo grande en trozos", () => {
    const grande = Array.from({ length: 25 }, (_, i) => item(`g:${i}`, ejercicio("x")));
    const partes = empaquetar(grande);
    expect(partes.flat()).toHaveLength(25);
    expect(partes.every((p) => p.length <= MAXIMO_PARTE)).toBe(true);
  });
});

describe("nombreDe", () => {
  it("quita el prefijo de los métodos y resume si son muchos", () => {
    expect(nombreDe(["String.prototype.slice()", "String.prototype.split()"])).toBe("slice() · split()");
    expect(nombreDe(["A", "B", "C", "D", "E"])).toBe("A · B y 3 más");
    expect(nombreDe(["A", "A", null])).toBe("A");
  });
});

describe("planUnidad", () => {
  it("arma los grupos con sus lecciones y solo cuenta lo de su unidad", () => {
    const plan = planUnidad(items, {}, "u1");
    expect(plan.grupos.map((g) => g.id)).toEqual(["esencial", "codigo", "metodos"]);
    expect(plan.grupos.find((g) => g.id === "metodos").opcional).toBe(true);
    expect(plan.total).toBe(plan.grupos.filter((g) => !g.opcional).reduce((t, g) => t + g.lecciones.length, 0));
    expect(plan.preguntas.total).toBe(21); // los métodos no cuentan para completar
    expect(plan.estado).toBe("nueva");
    expect(plan.siguiente.id).toBe("esencial-1");
  });

  it("una lección queda hecha apenas respondes todas sus preguntas una vez, aunque falles", () => {
    const registros = Object.fromEntries(items.slice(0, 9).map((it, i) => [it.clave, { caja: 1, ultima: i === 0 ? "no" : "sabia", proximo: "2026-11-18" }]));
    const plan = planUnidad(items, registros, "u1");
    const esencial = plan.grupos[0].lecciones[0];
    expect(esencial.hecha).toBe(true);
    expect(esencial.aprendidos).toBe(8);
    expect(esencial.errores).toBe(1);
    expect(plan.hechas).toBe(1);
    expect(plan.estado).toBe("empezada");
    expect(plan.siguiente.grupo).toBe("codigo");
  });

  it("primero sigue la lección a medias", () => {
    const registros = { "ej:b:0": { caja: 1, ultima: "sabia" } };
    const plan = planUnidad(items, registros, "u1");
    expect(plan.siguiente.claves).toContain("ej:b:0");
  });

  it("completa con las requeridas hechas; dominada con el 80% fijado", () => {
    const requeridos = items.filter((it) => it.unidad === "u1" && it.fuente.tipo !== "referencia");
    const hechos = Object.fromEntries(requeridos.map((it) => [it.clave, { caja: 1, ultima: "sabia" }]));
    const plan = planUnidad(items, hechos, "u1");
    expect(plan.completa).toBe(true);
    expect(plan.dominada).toBe(false);
    expect(plan.siguiente.grupo).toBe("metodos"); // quedan las opcionales
    const fijados = Object.fromEntries(requeridos.map((it) => [it.clave, { caja: 3, ultima: "sabia" }]));
    expect(planUnidad(items, fijados, "u1").estado).toBe("dominada");
  });

  it("las reportadas no cuentan", () => {
    const reportados = Object.fromEntries(items.slice(0, 9).map((it) => [it.clave, true]));
    expect(planUnidad(items, {}, "u1", reportados).grupos[0].id).toBe("esencial");
    expect(planUnidad(items, {}, "u1", reportados).grupos[0].lecciones[0].hecha).toBe(false);
  });

  it("despuesDe da la siguiente sin hacer", () => {
    const plan = planUnidad(items, {}, "u1");
    const primera = plan.grupos[0].lecciones[0].id;
    expect(despuesDe(plan, primera).id).not.toBe(primera);
  });
});

describe("modos parte y prueba del motor", () => {
  it("parte: todas las preguntas que recibe", () => {
    const deParte = items.slice(9, 13);
    const pasos = armarLeccion({ items: deParte, registros: {}, hoy: "2026-11-17", unidad: "u1", modo: "parte", azar: () => 0.3 });
    expect(pasos.map((p) => p.clave).sort()).toEqual(deParte.map((it) => it.clave).sort());
  });

  it("prueba: de la unidad, sin tarjetas y sin segunda oportunidad", () => {
    const conTarjeta = [...items, item("tarjeta:1", ejercicio("z"), { tipo: "tarjeta", subtipo: "tarjeta" })];
    const pasos = armarLeccion({ items: conTarjeta, registros: {}, hoy: "2026-11-17", unidad: "u1", modo: "prueba", azar: () => 0.5 });
    expect(pasos).toHaveLength(12);
    expect(pasos.every((p) => p.tipo !== "tarjeta" && p.item.unidad === "u1")).toBe(true);
    const { nota } = responder(crearSesion(pasos, { modo: "prueba" }), { correcto: false });
    expect(nota).toBe("no");
  });

  it("pruebaAprobada pide el 80%", () => {
    expect(pruebaAprobada({ mejor: 10, total: 12 })).toBe(true);
    expect(pruebaAprobada({ mejor: 9, total: 12 })).toBe(false);
    expect(pruebaAprobada(undefined)).toBe(false);
  });
});
