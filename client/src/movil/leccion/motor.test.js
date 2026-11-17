import { describe, expect, test } from "vitest";
import { armarLeccion, avanceUnidad, intercalarPorTipo, crearSesion, ordenCorrecto, pasoActual, responder, resumen, semilla, terminada, XP, resultadoNivel } from "./motor.js";

const HOY = "2026-11-15";
const it = (clave, unidad, tipo = "opcion", extra = {}) => ({ clave, unidad, tipo, ...extra });

describe("armarLeccion", () => {
  const items = [
    ...Array.from({ length: 8 }, (_, i) => it(`a${i}`, "arrays")),
    it("par1", "arrays", "emparejar"),
    it("ord1", "arrays", "ordenar"),
    it("tar1", "arrays", "tarjeta"),
    ...Array.from({ length: 5 }, (_, i) => it(`o${i}`, "objetos")),
  ];

  test("primero repasos vencidos de cualquier unidad, luego nuevos de la unidad actual", () => {
    const registros = { o0: { caja: 1, proximo: "2026-11-14" }, o1: { caja: 2, proximo: "2026-11-15" }, o2: { caja: 2, proximo: "2026-11-20" } };
    const pasos = armarLeccion({ items, registros, hoy: HOY, unidad: "arrays", modo: "rapida", azar: semilla("x") });
    const claves = pasos.map((p) => p.clave);
    expect(pasos).toHaveLength(5);
    expect(claves).toContain("o0");
    expect(claves).toContain("o1");
    expect(claves).not.toContain("o2"); // aún no le toca
    expect(claves.filter((c) => /^o[0-9]$/.test(c))).toHaveLength(2);
  });

  test("no más de 4 nuevos si hay repasos de sobra para llenar", () => {
    const vencidos = ["o0", "o1", "o2", "o3", "o4", "a4", "a5", "a6", "a7"];
    const registros = Object.fromEntries(vencidos.map((c) => [c, { caja: 1, proximo: "2026-11-10" }]));
    const pasos = armarLeccion({ items, registros, hoy: HOY, unidad: "arrays", modo: "normal", azar: semilla("y") });
    const nuevos = pasos.filter((p) => p.item && !registros[p.clave]);
    expect(nuevos.length).toBeLessThanOrEqual(4);
    expect(nuevos.length).toBeGreaterThanOrEqual(2); // siempre deja lugar para algo nuevo
  });

  test("si no hay qué repasar, la lección se completa con nuevos (la primera lección no queda corta)", () => {
    const pasos = armarLeccion({ items, registros: {}, hoy: HOY, unidad: "arrays", modo: "rapida", azar: semilla("n") });
    expect(pasos).toHaveLength(5);
  });

  test("los reportados no salen", () => {
    const pasos = armarLeccion({ items, registros: {}, reportados: { a0: true, a1: true }, hoy: HOY, unidad: "arrays", azar: semilla("z") });
    expect(pasos.map((p) => p.clave)).not.toContain("a0");
  });

  test("ordena de reconocer a producir: emparejar antes que ordenar y tarjeta al final", () => {
    const pocos = [it("x1", "u"), it("p1", "u", "emparejar"), it("t1", "u", "tarjeta"), it("r1", "u", "ordenar")];
    const pasos = armarLeccion({ items: pocos, registros: {}, hoy: HOY, unidad: "u", modo: "rapida", azar: semilla("w") });
    expect(pasos.map((p) => p.tipo)).toEqual(["emparejar", "opcion", "ordenar", "tarjeta"]);
  });

  test("la lección normal agrega tarjetas de entrevista vencidas (máximo 2) o una nueva", () => {
    const preguntas = [{ id: "e1" }, { id: "e2" }, { id: "e3" }, { id: "e4", personal: true }];
    const conVencidas = armarLeccion({
      items,
      registros: {},
      preguntas,
      registrosPreguntas: { e1: { proximo: "2026-11-01" }, e2: { proximo: "2026-11-02" }, e3: { proximo: "2026-11-03" } },
      hoy: HOY,
      unidad: "arrays",
      azar: semilla("q"),
    });
    expect(conVencidas.filter((p) => p.tipo === "entrevista")).toHaveLength(2);
    expect(conVencidas).toHaveLength(10);
    const sinVencidas = armarLeccion({ items, registros: {}, preguntas, hoy: HOY, unidad: "arrays", azar: semilla("q") });
    const entrevista = sinVencidas.filter((p) => p.tipo === "entrevista");
    expect(entrevista).toHaveLength(1);
    expect(entrevista[0].pregunta.personal).toBeFalsy();
  });

  test("modo errores: solo lo que está en caja 1", () => {
    const registros = { a0: { caja: 1, proximo: "2026-11-20" }, a1: { caja: 3, proximo: "2026-11-20" } };
    const pasos = armarLeccion({ items, registros, hoy: HOY, unidad: "arrays", modo: "errores" });
    expect(pasos.map((p) => p.clave)).toEqual(["a0"]);
  });

  test("modo quiz: solo preguntas de quiz de la unidad", () => {
    const conQuiz = [...items, it("q1", "arrays", "opcion", { subtipo: "quiz" }), it("q2", "objetos", "opcion", { subtipo: "quiz" })];
    const pasos = armarLeccion({ items: conQuiz, registros: {}, hoy: HOY, unidad: "arrays", modo: "quiz" });
    expect(pasos.map((p) => p.clave)).toEqual(["q1"]);
  });

  test("con la misma semilla, la misma lección", () => {
    const a = armarLeccion({ items, registros: {}, hoy: HOY, unidad: "arrays", azar: semilla("s") }).map((p) => p.clave);
    const b = armarLeccion({ items, registros: {}, hoy: HOY, unidad: "arrays", azar: semilla("s") }).map((p) => p.clave);
    expect(a).toEqual(b);
  });
});

describe("sesión", () => {
  const pasos = [it("a", "u"), it("b", "u"), { clave: "t", tipo: "tarjeta", item: {} }];

  test("acertar a la primera da sabía y 10 XP", () => {
    let s = crearSesion(pasos);
    const r = responder(s, { correcto: true });
    expect(r.nota).toBe("sabia");
    expect(r.sesion.xp).toBe(XP.primera);
    expect(pasoActual(r.sesion).clave).toBe("b");
  });

  test("fallar manda el ítem al final; acertarlo después da dudé, fallarlo otra vez da no", () => {
    let s = crearSesion(pasos);
    let r = responder(s, { correcto: false });
    expect(r.nota).toBeNull();
    s = r.sesion;
    expect(s.cola).toEqual([0, 1, 2, 0]);
    s = responder(s, { correcto: true }).sesion; // b
    s = responder(s, { nota: "dude" }).sesion; // tarjeta
    expect(pasoActual(s).clave).toBe("a");
    r = responder(s, { correcto: true });
    expect(r.nota).toBe("dude");
    expect(terminada(r.sesion)).toBe(true);

    let s2 = crearSesion([it("x", "u")]);
    s2 = responder(s2, { correcto: false }).sesion;
    expect(responder(s2, { correcto: false }).nota).toBe("no");
  });

  test("resumen: aciertos a la primera, XP con bono y lo fallado", () => {
    let s = crearSesion(pasos);
    s = responder(s, { correcto: true }).sesion;
    s = responder(s, { correcto: false }).sesion;
    s = responder(s, { nota: "sabia" }).sesion;
    s = responder(s, { correcto: true }).sesion; // b en el reintento
    const r = resumen(s);
    expect(r.aciertos).toBe(2);
    expect(r.xp).toBe(XP.primera * 2 + XP.reintento + XP.leccion);
    expect(r.fallados.map((p) => p.clave)).toEqual(["b"]);
  });

  test("la sesión se puede guardar como JSON y retomar", () => {
    const s = responder(crearSesion(pasos), { correcto: false }).sesion;
    const retomada = JSON.parse(JSON.stringify(s));
    expect(pasoActual(retomada).clave).toBe("b");
  });
});

describe("ordenar líneas", () => {
  const item = { lineas: ["function f(a) {", "  return a;", "}"] };
  test("acepta el orden correcto aunque cambie la sangría", () => {
    expect(ordenCorrecto(item, ["function f(a) {", "return a;", "}"])).toBe(true);
  });
  test("rechaza otro orden o líneas de menos", () => {
    expect(ordenCorrecto(item, ["  return a;", "function f(a) {", "}"])).toBe(false);
    expect(ordenCorrecto(item, ["function f(a) {", "}"])).toBe(false);
  });
});

describe("avance de una unidad", () => {
  test("dominada con 80% de ítems en caja 3 o más", () => {
    const items = Array.from({ length: 5 }, (_, i) => it(`a${i}`, "arrays"));
    const registros = { a0: { caja: 3 }, a1: { caja: 4 }, a2: { caja: 3 }, a3: { caja: 5 }, a4: { caja: 1 } };
    expect(avanceUnidad(items, registros, "arrays")).toMatchObject({ total: 5, vistos: 5, dominados: 4, dominada: true });
    expect(avanceUnidad(items, {}, "arrays")).toMatchObject({ vistos: 0, dominada: false });
  });
});

describe("variedad", () => {
  test("intercala los tipos: no salen todos los de un tipo seguidos", () => {
    const lista = [it("d1", "u", "opcion", { subtipo: "devuelve" }), it("d2", "u", "opcion", { subtipo: "devuelve" }), it("d3", "u", "opcion", { subtipo: "devuelve" }), it("q1", "u", "opcion", { subtipo: "quiz" }), it("h1", "u", "hueco")];
    expect(intercalarPorTipo(lista).map((x) => x.clave)).toEqual(["d1", "q1", "h1", "d2", "d3"]);
  });
  test("una lección con muchos ítems de un tipo igual trae de los otros", () => {
    const muchos = [...Array.from({ length: 20 }, (_, i) => it(`d${i}`, "u", "opcion", { subtipo: "devuelve" })), it("q1", "u", "opcion", { subtipo: "quiz" }), it("q2", "u", "opcion", { subtipo: "quiz" }), it("t1", "u", "tarjeta")];
    const pasos = armarLeccion({ items: muchos, registros: {}, hoy: HOY, unidad: "u", modo: "rapida", azar: semilla("v") });
    const tipos = new Set(pasos.map((p) => p.item.subtipo ?? p.tipo));
    expect(tipos.has("quiz")).toBe(true);
    expect(tipos.has("tarjeta")).toBe(true);
  });
});

describe("inglés: escuchar, armar y prueba de nivel", () => {
  const u = (id, n) => [
    { clave: `gra:${id}`, tipo: "opcion", subtipo: "gramatica", unidad: id },
    { clave: `en:${id}`, tipo: "opcion", subtipo: "palabra", unidad: id },
    { clave: `esc:${id}`, tipo: "opcion", subtipo: "escuchar", unidad: id, n },
    { clave: `arm:${id}`, tipo: "armar", subtipo: "traducir", unidad: id },
  ];
  const unidades = [{ id: "u1" }, { id: "u2" }, { id: "u3" }];
  const items = [...u("u1"), ...u("u2"), ...u("u3")];

  test("sin voz en inglés no salen los ítems de escuchar", () => {
    const pasos = armarLeccion({ items, registros: {}, hoy: "2026-11-16", unidad: "u1", conVoz: false, azar: semilla("x") });
    expect(pasos.some((p) => p.item.subtipo === "escuchar")).toBe(false);
  });

  test("modo escuchar solo trae ítems de escuchar o dictado", () => {
    const pasos = armarLeccion({ items, registros: {}, hoy: "2026-11-16", unidad: "u2", unidades, modo: "escuchar", azar: semilla("x") });
    expect(pasos.length).toBeGreaterThan(0);
    expect(pasos.every((p) => p.item.subtipo === "escuchar")).toBe(true);
    expect(pasos.some((p) => p.item.unidad === "u3")).toBe(false); // no adelanta unidades
  });

  test("prueba de nivel: 2 por unidad en orden, lo fallado no vuelve y empiezas donde fallaste", () => {
    const pasos = armarLeccion({ items, registros: {}, hoy: "2026-11-16", unidades, modo: "nivel" });
    expect(pasos.map((p) => p.clave)).toEqual(["gra:u1", "en:u1", "gra:u2", "en:u2", "gra:u3", "en:u3"]);
    let s = crearSesion(pasos, { modo: "nivel" });
    for (const correcto of [true, true, true, false, true, true]) s = responder(s, { correcto }).sesion;
    expect(terminada(s)).toBe(true);
    expect(resultadoNivel(s, unidades).empiezaEn).toBe("u2");
  });

  test("prueba de nivel con muchas unidades: 1 por unidad alternando, ninguna queda fuera", () => {
    const muchas = Array.from({ length: 47 }, (_, i) => ({ id: `m${i}` }));
    const conceptos = muchas.flatMap(({ id }) => [
      { clave: `gra:${id}`, tipo: "opcion", subtipo: "gramatica", unidad: id },
      { clave: `en:${id}`, tipo: "concepto", concepto: "palabra", unidad: id },
    ]);
    const pasos = armarLeccion({ items: conceptos, registros: {}, hoy: "2026-11-16", unidades: muchas, modo: "nivel" });
    expect(pasos).toHaveLength(47);
    expect(new Set(pasos.map((p) => p.item.unidad)).size).toBe(47);
    expect(pasos.slice(0, 2).map((p) => p.clave)).toEqual(["gra:m0", "en:m1"]);
  });
});

describe("examen semanal", () => {
  test("toma lo que viste desde el lunes y no repite lo fallado", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ clave: `q${i}`, tipo: "opcion", subtipo: "quiz", unidad: "u" }));
    const registros = Object.fromEntries(items.map((it, i) => [it.clave, { caja: 1, en: i < 22 ? "2026-11-17T10:00:00-05:00" : "2026-11-01T10:00:00-05:00" }]));
    const pasos = armarLeccion({ items, registros, hoy: "2026-11-21", unidad: "u", modo: "examen", azar: semilla("e") });
    expect(pasos).toHaveLength(20);
    expect(pasos.every((p) => Number(p.clave.slice(1)) < 22)).toBe(true);
    let s = crearSesion(pasos, { modo: "examen" });
    s = responder(s, { correcto: false }).sesion;
    expect(s.cola).toHaveLength(20);
  });
});
