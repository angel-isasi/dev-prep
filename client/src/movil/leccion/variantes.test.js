import { describe, expect, test } from "vitest";
import { avanceConceptos, elegirVariante, emparejarDe, variarPasos } from "./variantes.js";
import { armarLeccion, crearSesion, responder, resumen, semilla, terminada, sinVidas, XP } from "./motor.js";

const HOY = "2026-11-17";
const v = (forma, nivel, extra = {}) => ({ forma, nivel, tipo: "opcion", pregunta: forma, ...extra });
const concepto = (clave, unidad = "u1", extra = {}) => ({
  clave,
  unidad,
  tipo: "concepto",
  concepto: "frase",
  en: clave,
  es: clave,
  variantes: [v("escuchar", 0, { voz: true }), v("hueco", 0), v("traducir", 1), v("dictado", 2, { voz: true }), v("hablar", 2, { micro: true }), v("escribir", 3)],
  ...extra,
});

describe("elegirVariante", () => {
  const item = concepto("fr:1");
  const formas = (registro, opciones) => new Set(Array.from({ length: 40 }, (_, i) => elegirVariante(item, registro, { azar: semilla(`s${i}`), ...opciones }).forma));

  test("nuevo: reconocer; caja 1: producir con ayuda; caja 2: sin ayuda", () => {
    expect(formas(undefined)).toEqual(new Set(["escuchar", "hueco"]));
    expect(formas({ caja: 1 })).toEqual(new Set(["traducir"]));
    expect(formas({ caja: 2 })).toEqual(new Set(["dictado"])); // hablar necesita micrófono
    expect(formas({ caja: 2 }, { conMicro: true })).toEqual(new Set(["dictado", "hablar"]));
  });

  test("ya fijado (caja 3+): cualquier forma de nivel 1 o más, para variar", () => {
    expect(formas({ caja: 4 })).toEqual(new Set(["traducir", "dictado", "escribir"]));
  });

  test("sin voz no salen las de escuchar; solo escuchar deja solo esas", () => {
    expect(formas(undefined, { conVoz: false })).toEqual(new Set(["hueco"]));
    expect(formas({ caja: 1 }, { soloVoz: true })).toEqual(new Set(["escuchar"]));
  });

  test("legendario: lo más difícil; y el resultado lleva los datos del concepto", () => {
    expect(formas(undefined, { nivelMinimo: 2 })).toEqual(new Set(["dictado", "escribir"]));
    const elegido = elegirVariante(item, undefined, { azar: () => 0 });
    expect(elegido).toMatchObject({ clave: "fr:1", unidad: "u1", tipo: "opcion", forma: "escuchar" });
    expect(elegido.variantes).toBeUndefined();
  });

  test("evitar repite lo menos posible", () => {
    expect(formas(undefined, { evitar: "escuchar" })).toEqual(new Set(["hueco"]));
  });
});

describe("avance por conceptos", () => {
  const items = Array.from({ length: 10 }, (_, i) => concepto(`fr:${i}`));
  test("aprendidos, fijados, nivel de 0 a 5 y lecciones que faltan", () => {
    const registros = { "fr:0": { caja: 1 }, "fr:1": { caja: 1 }, "fr:2": { caja: 3 }, "fr:3": { caja: 0 } };
    expect(avanceConceptos(items, registros, "u1")).toMatchObject({ total: 10, vistos: 4, aprendidos: 3, fijados: 1, meta: 6, nivel: 2, leccionesFaltan: 1, completa: false });
  });

  test("fallar un concepto no lo cuenta como aprendido ni sube su dificultad", () => {
    const fallados = Object.fromEntries(items.map((it) => [it.clave, { caja: 1, ultima: "no" }]));
    expect(avanceConceptos(items, fallados, "u1")).toMatchObject({ vistos: 10, aprendidos: 0, nivel: 0, completa: false });
    const acertados = Object.fromEntries(items.map((it) => [it.clave, { caja: 1, ultima: "sabia" }]));
    expect(avanceConceptos(items, acertados, "u1")).toMatchObject({ aprendidos: 10, completa: true });
    const item = concepto("fr:x");
    expect(elegirVariante(item, { caja: 1, ultima: "no" }, { azar: () => 0 }).nivel).toBe(0);
    expect(elegirVariante(item, { caja: 1, ultima: "sabia" }, { azar: () => 0 }).nivel).toBe(1);
  });
});

describe("lección de inglés", () => {
  const items = [...Array.from({ length: 20 }, (_, i) => concepto(`fr:${i}`)), ...Array.from({ length: 6 }, (_, i) => concepto(`fr:v${i}`, "u0"))];
  const variante = (it, op) => elegirVariante(it, undefined, { ...op, azar: () => 0 });

  test("7 pasos con al menos 5 conceptos nuevos aunque haya muchos repasos", () => {
    const registros = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`fr:v${i}`, { caja: 1, proximo: "2026-11-10" }]));
    const pasos = armarLeccion({ items, registros, hoy: HOY, unidad: "u1", variante, azar: semilla("a") });
    expect(pasos).toHaveLength(7);
    expect(pasos.filter((p) => p.item.unidad === "u1").length).toBeGreaterThanOrEqual(5);
    expect(pasos.every((p) => p.item.forma)).toBe(true);
  });

  test("mezcla: solo lo ya visto de tu unidad y las anteriores", () => {
    const registros = { "fr:v0": { caja: 1, proximo: "2099-01-01" }, "fr:1": { caja: 2, proximo: "2099-01-01" } };
    const unidades = [{ id: "u0" }, { id: "u1" }];
    const pasos = armarLeccion({ items, registros, hoy: HOY, unidad: "u1", modo: "mezcla", unidades, variante, azar: semilla("b") });
    expect(pasos.map((p) => p.clave).sort()).toEqual(["fr:1", "fr:v0"]);
  });

  test("emparejar al vuelo con 4 palabras distintas", () => {
    const palabras = Array.from({ length: 5 }, (_, i) => ({ clave: `en:${i}`, concepto: "palabra", en: `w${i}`, es: `p${i}`, fuente: {} }));
    const par = emparejarDe(palabras, semilla("c"));
    expect(par.pares).toHaveLength(4);
    expect(par.extra).toBe(true);
  });
});

describe("sesión: combo, vidas, saltar y lección perfecta", () => {
  const pasos = Array.from({ length: 6 }, (_, i) => ({ clave: `k${i}`, tipo: "opcion", item: { tipo: "opcion" } }));

  test("combo: sube con aciertos a la primera, da bono desde 5 y se corta al fallar", () => {
    let s = crearSesion(pasos, { modo: "normal", hoy: HOY });
    for (let i = 0; i < 5; i++) s = responder(s, { correcto: true }).sesion;
    expect(s.combo).toBe(5);
    expect(s.xp).toBe(5 * XP.primera + XP.combo);
    s = responder(s, { correcto: false }).sesion;
    expect(s.combo).toBe(0);
    expect(s.comboMax).toBe(5);
  });

  test("perfecta: todo a la primera da bono", () => {
    let s = crearSesion(pasos, { hoy: HOY });
    for (let i = 0; i < 6; i++) s = responder(s, { correcto: true }).sesion;
    const r = resumen(s);
    expect(r.perfecta).toBe(true);
    expect(r.xp).toBe(s.xp + XP.leccion + XP.perfecta);
  });

  test("vidas: cada error resta una y en 0 la lección termina sin bono", () => {
    let s = crearSesion(pasos, { hoy: HOY, vidas: 2 });
    s = responder(s, { correcto: false }).sesion;
    expect(s.vidas).toBe(1);
    s = responder(s, { correcto: false }).sesion;
    expect(terminada(s)).toBe(true);
    expect(sinVidas(s)).toBe(true);
    expect(resumen(s)).toMatchObject({ sinVidas: true, perfecta: false });
  });

  test("saltar (no puedo hablar ahora) no califica ni vuelve, y no cuenta en el total", () => {
    let s = crearSesion(pasos, { hoy: HOY });
    const { sesion, nota } = responder(s, { saltar: true });
    expect(nota).toBeNull();
    expect(sesion.cola).toHaveLength(6);
    s = sesion;
    for (let i = 1; i < 6; i++) s = responder(s, { correcto: true }).sesion;
    expect(resumen(s)).toMatchObject({ total: 5, aciertos: 5, perfecta: true });
  });
});

describe("variedad mínima de una lección", () => {
  const frase = (n) => ({
    clave: `fr:${n}`,
    unidad: "u1",
    tipo: "concepto",
    concepto: "frase",
    en: `frase ${n}`,
    es: `frase ${n}`,
    variantes: [v("escuchar", 0, { voz: true, subtipo: "escuchar" }), v("hueco", 0), { forma: "traducir", nivel: 1, tipo: "armar", respuesta: ["a"] }],
  });
  const items = [frase(1), frase(2), frase(3)];
  const conceptos = new Map(items.map((it) => [it.clave, it]));
  const pasos = items.map((it) => ({ clave: it.clave, tipo: "opcion", item: { ...it, ...v("hueco", 0), forma: "hueco" } }));

  test("si todo es de opción, una frase pasa a armar y otra a escuchar", () => {
    const r = variarPasos(pasos, conceptos);
    expect(r.map((p) => p.item.forma)).toEqual(["traducir", "escuchar", "hueco"]);
    expect(r[0].tipo).toBe("armar");
    expect(r[0].item.variantes).toBeUndefined();
  });

  test("sin voz no fuerza escuchar, y si ya hay armar no cambia nada", () => {
    expect(variarPasos(pasos, conceptos, { conVoz: false }).map((p) => p.item.forma)).toEqual(["traducir", "hueco", "hueco"]);
    const conArmar = [{ ...pasos[0], tipo: "armar", item: { ...pasos[0].item, tipo: "armar", forma: "traducir" } }, pasos[1]];
    expect(variarPasos(conArmar, conceptos, { conVoz: false })).toEqual(conArmar);
  });
});
