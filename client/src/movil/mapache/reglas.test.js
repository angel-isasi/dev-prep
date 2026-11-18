import { describe, expect, test } from "vitest";
import { clavesRobadas, comidaDelDia, estadoMapache, META_COMIDA, nivelIngles, rachaIngles, regalosDeNivel, revisarRespuesta, rondaNueva, xpDisponible } from "./reglas.js";
import { POSTALES, PREGUNTAS } from "./contenido.js";
import { cumpleReto, EXPRESIONES, franjaDe, FRASES_NIVEL, lineaDiario, RETOS } from "./contenido-nivel.js";

const hoy = "2026-11-17";
const lleno = { ingles: 3, inglesNuevos: 6, inglesAciertos: 20 }; // 12 + 12 + 10 = 34

describe("mapache", () => {
  test("come de lo que aprendes en inglés, no de abrir la app", () => {
    expect(comidaDelDia({})).toBe(0);
    expect(comidaDelDia({ lecciones: 5, lecturas: 3 })).toBe(0); // programación no cuenta
    expect(comidaDelDia(lleno)).toBeGreaterThanOrEqual(META_COMIDA);
    expect(comidaDelDia({ inglesSegundos: 600, inmersion: 10, mapache: 6 })).toBe(16);
  });

  test("nuevo, feliz, hambriento y dormido según el día y la hora", () => {
    expect(estadoMapache({ dias: {}, hoy }).estado).toBe("nuevo");
    expect(estadoMapache({ dias: { [hoy]: lleno }, hoy }).estado).toBe("feliz");
    expect(estadoMapache({ dias: { "2026-11-16": { ingles: 1 } }, hoy }).estado).toBe("hambriento");
    expect(estadoMapache({ dias: { "2026-11-16": { ingles: 1 } }, hoy, hora: 2 }).estado).toBe("dormido");
    expect(estadoMapache({ dias: { [hoy]: lleno }, hoy }).hambre).toBe(0);
  });

  test("tres días sin inglés: se escapa, y vuelve apenas practicas", () => {
    const viejo = { "2026-11-10": lleno };
    expect(estadoMapache({ dias: viejo, hoy }).estado).toBe("escapado");
    expect(estadoMapache({ dias: { ...viejo, [hoy]: { inglesSegundos: 120 } }, hoy }).estado).not.toBe("escapado");
  });

  test("se pone triste si se rompió la racha o si te robó muchas palabras", () => {
    expect(estadoMapache({ dias: { "2026-11-15": { ingles: 1 } }, hoy }).estado).toBe("triste");
    expect(estadoMapache({ dias: { "2026-11-16": { ingles: 2 } }, hoy, robados: 20 }).estado).toBe("triste");
  });

  test("racha de inglés", () => {
    expect(rachaIngles({ [hoy]: { ingles: 1 }, "2026-11-16": { inmersion: 5 }, "2026-11-14": { ingles: 1 } }, hoy)).toBe(2);
    expect(rachaIngles({ "2026-11-16": { ingles: 1 } }, hoy)).toBe(1);
  });

  test("nivel: el mayor entre el examen y las unidades completas", () => {
    const unidades = [
      { id: "a", nivel: "A1" },
      { id: "b", nivel: "A2" },
      { id: "c", nivel: "B1" },
    ];
    expect(nivelIngles({ unidades })).toBe("A1");
    expect(nivelIngles({ unidades, completa: (id) => id !== "c" })).toBe("A2");
    expect(nivelIngles({ examen: { nivel: "B2" }, unidades, completa: () => true })).toBe("B2");
    expect(regalosDeNivel("B2")).toEqual(["mochila", "lentes"]);
  });

  test("te roba los repasos vencidos de palabras y frases, los más atrasados primero", () => {
    const registros = {
      "en:w1": { proximo: "2026-11-17" },
      "fr:f1": { proximo: "2026-11-10" },
      "en:w2": { proximo: "2026-11-20" },
      "gra:g1": { proximo: "2026-11-01" },
    };
    expect(clavesRobadas(registros, hoy)).toEqual(["fr:f1", "en:w1"]);
  });

  test("el XP de la tienda es lo ganado en inglés menos lo comprado", () => {
    const dias = { a: { inglesXp: 100 }, b: { inglesXp: 50, xp: 999 } };
    expect(xpDisponible(dias, ["gorra"], [{ id: "gorra", precio: 80 }])).toBe(70);
  });

  test("la respuesta libre tiene que ser inglés y del largo de tu nivel", () => {
    const vocabulario = new Set(["student", "study", "engineering", "peru", "angel", "name"]);
    const tuyas = new Set(["student", "engineering"]);
    const bien = revisarRespuesta("My name is Angel. I'm a student and I study engineering.", { minimo: 5, vocabulario, tuyas });
    expect(bien.ok).toBe(true);
    expect(bien.usadas).toEqual(["student", "engineering"]);
    expect(revisarRespuesta("I study", { minimo: 5, vocabulario }).corto).toBe(true);
    expect(revisarRespuesta("me llamo angel y estudio ingenieria en la universidad", { minimo: 5, vocabulario }).noIngles).toBe(true);
  });

  test("el contenido está completo: 8 preguntas por nivel y una postal por nivel", () => {
    for (const nivel of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(PREGUNTAS[nivel]).toHaveLength(8);
      expect(POSTALES.filter((p) => p.nivel === nivel)).toHaveLength(1);
    }
    for (const p of POSTALES) for (const q of p.preguntas) expect(q.opciones[q.correcta]).toBeTruthy();
  });

  test("el diario cuenta el día en inglés, más rico en cada franja", () => {
    const dia = { minutos: 15, palabras: 1, lecciones: 2, historias: 0 };
    expect(lineaDiario({ ...dia, franja: "A", semilla: 0 }).en).toBe("We studied for 15 minutes. I ate 1 new word. We finished 2 lessons. It was a good day!");
    expect(lineaDiario({ ...dia, franja: "B", semilla: 0 }).en).toContain("I've picked up 1 new word.");
    expect(lineaDiario({ ...dia, franja: "C", semilla: 1 }).en).toBe("We clocked 15 minutes of English, added 1 word to the collection and saw off 2 lessons. That's more than most people manage on a Monday.");
    expect(lineaDiario({ minutos: 0, palabras: 0, lecciones: 0, historias: 0, franja: "B", semilla: 0 }).en).toContain("No English today");
  });

  test("te habla un nivel arriba: cada franja tiene frases para todos sus estados, con su expresión", () => {
    expect(["A1", "A2", "B1", "B2", "C1", "C2"].map(franjaDe)).toEqual(["A", "A", "B", "B", "C", "C"]);
    for (const franja of ["A", "B", "C"]) {
      for (const estado of ["nuevo", "feliz", "normal", "hambriento", "triste", "robos", "dormido", "escapado"]) {
        expect(FRASES_NIVEL[franja][estado]?.length, franja + estado).toBeGreaterThan(0);
        for (const frase of FRASES_NIVEL[franja][estado]) if (estado !== "dormido") expect(frase.expresion?.en, frase.en).toBeTruthy();
      }
      expect(EXPRESIONES[franja].length).toBeGreaterThanOrEqual(6);
    }
  });

  test("el reto de gramática de cada nivel reconoce su estructura", () => {
    for (const [nivel, reto] of Object.entries(RETOS)) expect(cumpleReto(nivel, reto.ejemplo), nivel).toBe(true);
    expect(cumpleReto("B1", "I like coffee.")).toBe(false);
    expect(cumpleReto("B2", "I would like a coffee.")).toBe(false);
    expect(cumpleReto("C1", "I study every day.")).toBe(false);
  });

});

describe("Trash panda", () => {
  const palabras = [
    { en: "work", es: "trabajar", tipo: "verbo", pasado: "worked" },
    { en: "go", es: "ir", tipo: "verbo", pasado: "went" },
    { en: "be", es: "ser", tipo: "verbo", pasado: "was / were" },
    { en: "desk", es: "escritorio", tipo: "sustantivo" },
    { en: "good morning", es: "buenos días", tipo: "expresion" },
  ];
  test("las rondas tienen la respuesta correcta en su tacho", () => {
    let i = 0;
    const secuencia = [0.1, 0.4, 0.2]; // pasado de "go" (índice 1 de 3), en pasado
    const r = rondaNueva(palabras, () => secuencia[i++ % 3]);
    expect(r).toEqual({ texto: "went", es: "ir", tachos: ["present", "past"], correcto: 1 });
    const t = rondaNueva(palabras, () => 0.99);
    expect(t.tachos).toEqual(["verb", "noun"]);
    expect(t.texto).toBe("desk");
    expect(t.correcto).toBe(1);
  });
});
