import { describe, expect, test } from "vitest";
import { estadoDominio, mapaDominio, unidadesDebiles } from "./dominio.js";

const unidades = [
  { id: "arrays", titulo: "Arrays", area: "javascript", conTeoria: true },
  { id: "objetos", titulo: "Objetos", area: "javascript", conTeoria: true },
  { id: "algoritmos", titulo: "Algoritmos", area: "algoritmos", conTeoria: false },
];
const temas = [
  { id: "arrays", ejercicios: ["e1", "e2"], quiz: [1, 2, 3, 4, 5] },
  { id: "objetos", ejercicios: ["e3"], quiz: [1, 2, 3, 4, 5] },
];
const ejercicios = [
  { id: "e1", tema: "arrays" },
  { id: "e2", tema: "arrays" },
  { id: "e3", tema: "objetos" },
  { id: "a1", tema: "algoritmos" },
];
const items = [
  { clave: "i1", unidad: "arrays" },
  { clave: "i2", unidad: "arrays" },
  { clave: "i3", unidad: "objetos" },
];

describe("mapa de dominio", () => {
  const mapa = mapaDominio({
    unidades,
    ejercicios,
    temas,
    registros: { e1: { estado: "resuelto", pistasVistas: 0 }, e2: { estado: "resuelto", pistasVistas: 0 }, e3: { estado: "en-progreso" } },
    quizzes: { arrays: { mejor: 5, total: 5 }, objetos: { mejor: 2, total: 5 } },
    items,
    registrosItems: { i1: { caja: 3 }, i2: { caja: 4 }, i3: { caja: 1 } },
    hoy: "2026-11-16",
  });
  const de = (id) => mapa.find((u) => u.id === id);

  test("todo resuelto, quiz perfecto e ítems dominados: verde y sin pendientes", () => {
    expect(de("arrays")).toMatchObject({ valor: 1, estado: "verde", falta: [] });
  });

  test("empezada pero floja: rojo, con lo que falta", () => {
    expect(de("objetos").estado).toBe("rojo");
    expect(de("objetos").falta).toEqual(["1 de 1 ejercicios por resolver", "1 preguntas de lección por dominar", "el quiz (tu mejor: 2/5)"]);
  });

  test("sin quiz ni ítems, solo cuentan los ejercicios; sin empezar es gris", () => {
    expect(de("algoritmos")).toMatchObject({ valor: 0, estado: "sin-empezar" });
  });

  test("las débiles son las empezadas más flojas", () => {
    expect(unidadesDebiles(mapa).map((u) => u.id)).toEqual(["objetos"]);
    expect(estadoDominio(0.5, true)).toBe("amarillo");
  });
});
