import { describe, expect, test } from "vitest";
import { palabrasClave, preguntasDelTema } from "./centro-tema.js";

const PREGUNTAS = [
  { id: "a", categoria: "JavaScript", pregunta: "¿Qué es un closure y para qué sirve?" },
  { id: "b", categoria: "JavaScript", pregunta: "¿Qué diferencia hay entre var, let y const?" },
  { id: "c", categoria: "JavaScript", pregunta: "Explica el scope léxico y cómo se relaciona con los closures." },
  { id: "d", categoria: "React", pregunta: "¿Qué es un closure viejo en un efecto?" },
  { id: "e", categoria: "JavaScript", pregunta: "¿Qué es una promesa?" },
];

describe("palabras clave de un tema", () => {
  test("salen del título y de sus términos, sin tildes ni la s final", () => {
    const claves = palabrasClave({ titulo: "Closures y scope", terminos: [{ termino: "Hoisting", en: "hoisting" }, { termino: "Ámbito léxico", en: "lexical scope" }] });
    expect(claves).toEqual(["closure", "scope", "hoisting", "ambito lexico", "lexical scope"]);
  });

  test("ignora palabras que no distinguen un tema de otro", () => {
    expect(palabrasClave({ titulo: "Variables y tipos" })).toEqual(["variable"]);
    expect(palabrasClave({ titulo: "React: estado y eventos" })).toEqual(["estado", "evento"]);
  });
});

describe("preguntas de entrevista de un tema", () => {
  const closures = { area: "javascript", titulo: "Closures y scope" };

  test("solo las de la categoría del área que mencionan el tema, primero las que más coinciden", () => {
    expect(preguntasDelTema(PREGUNTAS, closures).map((p) => p.id)).toEqual(["c", "a"]);
  });

  test("encuentra el singular aunque el título esté en plural", () => {
    expect(preguntasDelTema(PREGUNTAS, { area: "javascript", titulo: "Promesas y async/await" }).map((p) => p.id)).toEqual(["e"]);
  });

  test("respeta el límite", () => {
    expect(preguntasDelTema(PREGUNTAS, closures, { limite: 1 })).toHaveLength(1);
  });

  test("sin categoría para el área o sin palabras clave, no devuelve nada", () => {
    expect(preguntasDelTema(PREGUNTAS, { area: "algoritmos", titulo: "Closures" })).toEqual([]);
    expect(preguntasDelTema(PREGUNTAS, { area: "javascript", titulo: "Tipos" })).toEqual([]);
  });
});
