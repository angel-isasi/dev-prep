import { describe, expect, test } from "vitest";
import { PUNTOS, PUNTOS_POR_META, desglosePuntos, huboEstudio, puntosDe, segundosDe } from "./puntos.js";

describe("puntos de estudio", () => {
  test("un ejercicio resuelto vale una unidad de la meta", () => {
    expect(puntosDe({ resueltos: 1 })).toBe(PUNTOS_POR_META);
  });

  test("suma todo lo del día, de la laptop y del celular", () => {
    // 2 ejercicios (50) + 1 sin pistas (10) + 1 repaso (10) + 1 lección (8) + 1 de inglés (8) + 1 estudiado (5) + 1 quiz (5)
    expect(puntosDe({ resueltos: 2, limpios: 1, repasos: 1, lecciones: 1, ingles: 1, lecturas: 1, quizzes: 1 })).toBe(96);
  });

  test("respeta el máximo por día de lo fácil de repetir", () => {
    expect(puntosDe({ lecciones: 9 })).toBe(24);
    expect(puntosDe({ ingles: 9 })).toBe(24);
    expect(puntosDe({ lecturas: 9 })).toBe(20);
    expect(puntosDe({ quizzes: 9 })).toBe(10);
  });

  test("las tarjetas cuentan por tandas de 10", () => {
    expect(puntosDe({ preguntas: 9 })).toBe(0);
    expect(puntosDe({ preguntas: 19 })).toBe(5);
    expect(puntosDe({ preguntas: 50 })).toBe(10);
  });

  test("el desglose solo trae lo que sumó", () => {
    expect(desglosePuntos({ resueltos: 1, lecciones: 5, preguntas: 3 }).map((f) => [f.campo, f.cantidad, f.puntos])).toEqual([
      ["resueltos", 1, 25],
      ["lecciones", 5, 24],
    ]);
    expect(desglosePuntos(undefined)).toEqual([]);
  });

  test("un día vacío o que no existe da cero", () => {
    expect(puntosDe(undefined)).toBe(0);
    expect(puntosDe({ preparacion: 12, segundos: 300 })).toBe(0);
  });

  test("los segundos de estudio juntan laptop, lecciones e inglés", () => {
    expect(segundosDe({ segundos: 100, leccionesSegundos: 50, inglesSegundos: 25 })).toBe(175);
    expect(segundosDe(undefined)).toBe(0);
  });

  test("hubo estudio aunque no diera puntos", () => {
    expect(huboEstudio({ preguntas: 2 })).toBe(true);
    expect(huboEstudio({ segundos: 60 })).toBe(true);
    expect(huboEstudio({ mapache: 1 })).toBe(true);
    expect(huboEstudio({ preparacion: 10 })).toBe(false);
    expect(huboEstudio(undefined)).toBe(false);
  });

  test("ninguna fila de la tabla se repite", () => {
    expect(new Set(PUNTOS.map((p) => p.campo)).size).toBe(PUNTOS.length);
  });
});
