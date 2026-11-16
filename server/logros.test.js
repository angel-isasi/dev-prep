import { describe, expect, test } from "vitest";
import { calcularLogros, INSIGNIAS, NIVELES, semaforoPostular } from "./logros.js";

describe("niveles e insignias", () => {
  test("sin nada, nivel 1 y el siguiente con sus requisitos", () => {
    const r = calcularLogros({});
    expect(r.nivel.titulo).toBe("Curioso");
    expect(r.siguiente.titulo).toBe("Aprendiz");
    expect(r.siguiente.requisitos.every((q) => !q.listo)).toBe(true);
    expect(r.nuevos).toEqual([]);
  });

  test("al cumplir todos los requisitos sube de nivel y avisa una sola vez", () => {
    const estado = { resueltos: 12, lecciones: 6, racha: 3 };
    const r = calcularLogros(estado);
    expect(r.nivel.titulo).toBe("Aprendiz");
    expect(r.nuevos.map((n) => n.id)).toContain("nivel-2");
    const vistos = Object.fromEntries(r.nuevos.map((n) => [n.id, {}]));
    expect(calcularLogros(estado, vistos).nuevos).toEqual([]);
  });

  test("las insignias y los niveles ganados no se pierden aunque baje la racha", () => {
    const vistos = { "racha-7": {}, "nivel-2": {} };
    const r = calcularLogros({ racha: 0 }, vistos);
    expect(r.insignias.find((i) => i.id === "racha-7").ganada).toBe(true);
    expect(r.nivel.id).toBe(2);
  });

  test("ids únicos y metas positivas", () => {
    expect(new Set(INSIGNIAS.map((i) => i.id)).size).toBe(INSIGNIAS.length);
    expect(NIVELES.map((n) => n.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("semáforo para postular", () => {
    expect(semaforoPostular({}, 1).color).toBe("rojo");
    const listo = { preparacion: 60, simulacros: 3, pitch: true, historias: 3, inglesDominadas: 21, portafolio: 2 };
    expect(semaforoPostular(listo, 4).color).toBe("verde");
  });
});
