import { describe, expect, test } from "vitest";
import { seccionMarkdown } from "./markdown.js";
import { registrarQuiz } from "./progreso-reglas.js";
import { detalleTema, estadoDe, resumenTema } from "./vistas-aprender.js";
import { ejerciciosEntrevista, resumenEntrevistas, tarjetas } from "./vistas-entrevistas.js";

const HOY = "2026-11-15";

describe("seccionMarkdown", () => {
  const md = "## Idea clave\nUsa un Map.\n\n## Paso a paso\n1. Algo\r\n";
  test("saca el texto de una sección sin el título", () => {
    expect(seccionMarkdown(md, "Idea clave")).toBe("Usa un Map.");
  });
  test("devuelve null si la sección no existe", () => {
    expect(seccionMarkdown(md, "Conceptos")).toBeNull();
  });
});

describe("registrarQuiz", () => {
  test("guarda el mejor resultado aunque el último sea peor", () => {
    const primero = registrarQuiz(undefined, 4, 6, "t1");
    expect(primero).toEqual({ mejor: 4, total: 6, ultimo: 4, en: "t1" });
    expect(registrarQuiz(primero, 2, 6, "t2")).toEqual({ mejor: 4, total: 6, ultimo: 2, en: "t2" });
  });
});

describe("vistas de Aprender", () => {
  const temas = [
    { id: "t1", titulo: "Uno", area: "javascript", orden: 1, descripcion: "d1", ejercicios: ["e1", "e2"], quiz: [{}, {}], teoria: "# t1" },
    { id: "t2", titulo: "Dos", area: "javascript", orden: 2, descripcion: "d2", ejercicios: ["e3"], quiz: [{}], teoria: "# t2" },
    { id: "r1", titulo: "React", area: "react", orden: 1, descripcion: "d3", ejercicios: [], quiz: [], teoria: "" },
  ];
  const aprender = { temas, porId: new Map(temas.map((t) => [t.id, t])) };
  const ejercicios = [
    { id: "e1", titulo: "E1", nivel: 1, tema: "arrays" },
    { id: "e2", titulo: "E2", nivel: 2, tema: "arrays" },
  ];
  const indice = { porId: new Map(ejercicios.map((e) => [e.id, e])) };
  const progreso = {
    registros: { e1: { estado: "resuelto", repaso: null, repasando: false } },
    quizzes: { t1: { mejor: 2, total: 2, ultimo: 1, en: "x" } },
    hoy: HOY,
  };

  test("estadoDe: pendiente si nunca lo abriste", () => {
    expect(estadoDe({}, "e9", HOY)).toBe("pendiente");
  });

  test("resumenTema cuenta resueltos y el quiz", () => {
    expect(resumenTema(temas[0], progreso)).toEqual({
      id: "t1",
      titulo: "Uno",
      area: "javascript",
      orden: 1,
      descripcion: "d1",
      totalEjercicios: 2,
      resueltos: 1,
      quiz: { mejor: 2, total: 2 },
      preguntasQuiz: 2,
    });
  });

  test("detalleTema: vecinos solo dentro de la misma área y ejercicios que existen", () => {
    const t1 = detalleTema(aprender, "t1", indice, progreso);
    expect(t1.anterior).toBeNull();
    expect(t1.siguiente).toEqual({ id: "t2", titulo: "Dos" });
    expect(t1.ejercicios.map((e) => [e.id, e.estado])).toEqual([
      ["e1", "resuelto"],
      ["e2", "pendiente"],
    ]);
    const t2 = detalleTema(aprender, "t2", indice, progreso);
    expect(t2.siguiente).toBeNull(); // r1 es de otra área
    expect(t2.ejercicios).toEqual([]); // e3 no existe en el índice
  });

  test("detalleTema devuelve null si el tema no existe", () => {
    expect(detalleTema(aprender, "nada", indice, progreso)).toBeNull();
  });
});

describe("vistas de Entrevistas", () => {
  const entrevistas = {
    categorias: [{ nombre: "JS", total: 3, personal: false }],
    preguntas: [
      { id: "p1", categoria: "JS" },
      { id: "p2", categoria: "JS" },
      { id: "p3", categoria: "JS" },
    ],
    guias: { pitch: "x" },
  };
  const registros = {
    p1: { caja: 3, proximo: "2026-11-20" }, // dominada, no toca
    p2: { caja: 1, proximo: "2026-11-14" }, // toca repaso
  };

  test("resumen: vistas, dominadas, pendientes y total", () => {
    const r = resumenEntrevistas(entrevistas, registros, HOY);
    expect(r.categorias[0]).toMatchObject({ vistas: 2, dominadas: 1, pendientes: 1 });
    expect(r.total).toBe(3);
    expect(r.pendientesHoy).toBe(1);
    expect(r.guias).toEqual({ pitch: "x" });
  });

  test("tarjetas: primero repaso, luego nuevas, luego el resto", () => {
    expect(tarjetas(entrevistas, registros, HOY).map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
  });

  test("tarjetas por modo", () => {
    expect(tarjetas(entrevistas, registros, HOY, { modo: "repaso" }).map((p) => p.id)).toEqual(["p2"]);
    expect(tarjetas(entrevistas, registros, HOY, { modo: "nuevas" }).map((p) => p.id)).toEqual(["p3"]);
    expect(tarjetas(entrevistas, registros, HOY, { modo: "nuevas" })[0].progreso).toBeNull();
  });

  test("ejerciciosEntrevista: retos o nivel 2+, con su estado", () => {
    const lista = ejerciciosEntrevista(
      [
        { id: "a", titulo: "A", tema: "t", nivel: 1, coleccion: "javascript/guiados" },
        { id: "b", titulo: "B", tema: "t", nivel: 1, coleccion: "javascript/retos" },
        { id: "c", titulo: "C", tema: "t", nivel: 2, coleccion: "react/ejercicios" },
      ],
      { c: { estado: "resuelto" } },
    );
    expect(lista.map((e) => [e.id, e.estado])).toEqual([
      ["b", "pendiente"],
      ["c", "resuelto"],
    ]);
  });
});
