import { describe, expect, test } from "vitest";
import { semilla } from "../leccion/motor.js";
import { bancoExamen, certeza, crearExamen, EXAMEN, examenTerminado, hechaPorExamen, resultadoExamen, responderExamen, siguientePregunta, unidadTrasExamen } from "./examen.js";

// Un camino de 60 unidades con 6 preguntas de 4 opciones cada una
const unidades = Array.from({ length: 60 }, (_, i) => ({ id: `u${i}`, nivel: ["A1", "A2", "B1", "B2", "C1", "C2"][Math.floor(i / 10)] }));
const banco = unidades.map((u) => Array.from({ length: 6 }, (_, q) => ({ clave: `${u.id}-q${q}`, unidad: u.id, tipo: q % 2 ? "gramatica" : "palabra", opciones: ["a", "b", "c", "d"], correcta: 0 })));

/** Simula a alguien que domina las primeras `nivel` unidades (con despistes y suerte según `azar`). */
function simular(nivel, azar, { despiste = 0.08, adivina = true } = {}) {
  let ex = crearExamen(unidades.length);
  while (!examenTerminado(ex, banco)) {
    const { indice, pregunta } = siguientePregunta(ex, banco, azar);
    const domina = indice < nivel;
    const r = domina ? (azar() < despiste ? "mal" : "bien") : adivina ? (azar() < 0.25 ? "bien" : "mal") : "nose";
    ex = responderExamen(ex, indice, pregunta, r);
  }
  return ex;
}

describe("examen de nivel adaptativo", () => {
  test("ubica bien a niveles muy distintos, con despistes y aciertos de suerte", () => {
    const errores = [];
    for (const nivel of [0, 7, 23, 38, 51, 60]) {
      for (const s of ["a", "b", "c", "d", "e"]) {
        const ex = simular(nivel, semilla(`${nivel}-${s}`));
        const r = resultadoExamen(ex, unidades);
        errores.push(Math.abs(r.dominadas - nivel));
        expect(Math.abs(r.dominadas - nivel)).toBeLessThanOrEqual(5);
        expect(ex.respuestas.length).toBeGreaterThanOrEqual(EXAMEN.minimo);
        expect(ex.respuestas.length).toBeLessThanOrEqual(EXAMEN.maximo);
      }
    }
    // en promedio, a menos de una unidad de tu nivel real
    expect(errores.reduce((a, b) => a + b, 0) / errores.length).toBeLessThan(1);
  });

  test("con 'No lo sé' en vez de adivinar, termina más seguro", () => {
    const ex = simular(30, semilla("x"), { adivina: false });
    expect(Math.abs(resultadoExamen(ex, unidades).dominadas - 30)).toBeLessThanOrEqual(2);
    expect(certeza(ex.prob)).toBeGreaterThan(0.5);
  });

  test("no repite preguntas ni pasa de 3 por unidad", () => {
    const ex = simular(25, semilla("y"));
    expect(new Set(ex.usadas).size).toBe(ex.usadas.length);
    expect(Math.max(...Object.values(ex.porUnidad))).toBeLessThanOrEqual(EXAMEN.maxPorUnidad);
  });

  test("resultado: nivel, dónde empiezas y qué unidades quedan hechas", () => {
    const ex = simular(35, semilla("z"));
    const r = resultadoExamen(ex, unidades);
    expect(r.hasta).toBe(`u${r.dominadas}`);
    expect(r.nivel).toBe(unidades[r.dominadas - 1].nivel);
    const orden = unidades.map((u) => u.id);
    const guardado = { hasta: r.hasta, todas: r.todas };
    expect(hechaPorExamen(guardado, orden, "u0")).toBe(true);
    expect(hechaPorExamen(guardado, orden, r.hasta)).toBe(false);
    expect(hechaPorExamen({ hasta: "u59", todas: true }, orden, "u59")).toBe(true);
    expect(hechaPorExamen(null, orden, "u0")).toBe(false);
  });

  test("el banco toma gramática, natural y el significado de las palabras", () => {
    const items = [
      { clave: "gra:1", tipo: "opcion", subtipo: "gramatica", unidad: "u0", pregunta: "p", opciones: ["**a**", "b", "c"], correcta: 0 },
      { clave: "cal:1", tipo: "opcion", subtipo: "natural", unidad: "u1", pregunta: "p", opciones: ["a", "b"], correcta: 1 },
      { clave: "en:1", concepto: "palabra", unidad: "u1", en: "safe", es: "seguro", variantes: [{ forma: "palabra", opciones: ["x", "y", "z", "w"], correcta: 2 }] },
      { clave: "fr:1", concepto: "frase", unidad: "u0" },
    ];
    const b = bancoExamen(items, unidades.slice(0, 2));
    expect(b[0].map((p) => p.clave)).toEqual(["gra:1"]);
    expect(b[0][0].opciones[0]).toBe("a");
    expect(b[1].map((p) => p.tipo)).toEqual(["natural", "palabra"]);
  });

  test("repetir el examen no te retrocede: la unidad actual solo avanza", () => {
    const orden = ["u0", "u1", "u2", "u3"];
    expect(unidadTrasExamen(orden, "u1", "u3")).toBe("u3"); // el examen te lleva más adelante
    expect(unidadTrasExamen(orden, "u3", "u1")).toBe("u3"); // salió más bajo: te quedas donde ibas
    expect(unidadTrasExamen(orden, "u2", "u2")).toBe("u2");
    expect(unidadTrasExamen(orden, undefined, "u1")).toBe("u1"); // primer examen, sin unidad elegida
    expect(unidadTrasExamen(orden, "vieja", "u1")).toBe("u1"); // una unidad que ya no existe no cuenta
    expect(unidadTrasExamen(orden, "u2", null)).toBe("u2"); // examen sin resultado: no toca nada
  });
});
