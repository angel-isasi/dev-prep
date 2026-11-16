import { describe, expect, test } from "vitest";
import { compararAvance, marcaPersonal, planDeLaSemana, resultadoReto, retoDeLaSemana } from "./avance.js";

const ejercicios = [
  { id: "a", nivel: 1, coleccion: "javascript/ejercicios" },
  { id: "b", nivel: 2, coleccion: "javascript/retos" },
  { id: "c", nivel: 3, coleccion: "react/retos" },
  { id: "d", nivel: 2, coleccion: "react/retos" },
  { id: "e", nivel: 1, coleccion: "javascript/retos" },
  { id: "f", nivel: 2, coleccion: "javascript/ejercicios" },
];
const resuelto = (fecha, minutos, pistas = 0, intentos = 3) => ({
  estado: "resuelto",
  resueltoEn: `${fecha}T10:00:00-05:00`,
  segundosActivos: minutos * 60,
  pistasVistas: pistas,
  intentos,
});

describe("compararAvance", () => {
  test("sin historia suficiente no inventa frases", () => {
    const r = compararAvance({ ejercicios, registros: { a: resuelto("2026-11-10", 20) }, hoy: "2026-11-16" });
    expect(r.suficiente).toBe(false);
    expect(r.frases).toEqual([]);
    expect(r.ventanas[0].resueltos).toBe(1);
  });

  test("compara los últimos 30 días contra hace un mes", () => {
    const registros = {
      // hace un mes: lentos y con pistas
      a: resuelto("2026-10-05", 40, 2),
      b: resuelto("2026-10-08", 40, 2),
      e: resuelto("2026-10-10", 40, 2),
      // ahora: más rápidos y sin pistas
      c: resuelto("2026-11-10", 20),
      d: resuelto("2026-11-12", 20),
      f: resuelto("2026-11-14", 20),
    };
    const r = compararAvance({ ejercicios, registros, hoy: "2026-11-16" });
    expect(r.suficiente).toBe(true);
    expect(r.ventanas[0]).toMatchObject({ resueltos: 3, minutosPorEjercicio: 20, sinPistas: 100 });
    expect(r.ventanas[1]).toMatchObject({ resueltos: 3, minutosPorEjercicio: 40, sinPistas: 0 });
    expect(r.frases.join(" ")).toContain("50 % más rápido");
    expect(r.frases.join(" ")).toContain("menos pistas");
    expect(r.frases.join(" ")).toContain("más difíciles");
  });

  test("marca las ventanas anteriores a tu primer día", () => {
    const r = compararAvance({ ejercicios, registros: {}, hoy: "2026-11-16", primerDia: "2026-11-01" });
    expect(r.ventanas.map((v) => v.antesDeEmpezar)).toEqual([false, true, true]);
  });
});

describe("reto de la semana", () => {
  test("es el mismo toda la semana y solo de retos de nivel 2 o 3 sin resolver", () => {
    const uno = retoDeLaSemana(ejercicios, {}, "2026-11-16");
    expect(retoDeLaSemana(ejercicios, {}, "2026-11-16")).toBe(uno);
    expect(["b", "c", "d"]).toContain(uno.id);
    const otro = retoDeLaSemana(ejercicios, { b: { estado: "resuelto" }, c: { estado: "resuelto" } }, "2026-11-16");
    expect(otro.id).toBe("d");
  });

  test("si resolviste todos, igual propone uno", () => {
    const todos = { b: { estado: "resuelto" }, c: { estado: "resuelto" }, d: { estado: "resuelto" } };
    expect(retoDeLaSemana(ejercicios, todos, "2026-11-23")).not.toBeNull();
    expect(retoDeLaSemana([], {}, "2026-11-23")).toBeNull();
  });

  test("resultado: sin empezar, en curso, con solución y resuelto con puntos", () => {
    const reto = { inicio: "2026-11-16T10:00:00.000Z", pistasAlEmpezar: 1 };
    expect(resultadoReto(null, {}).estado).toBe("sin-empezar");
    expect(resultadoReto(reto, { estado: "en-progreso", pistasVistas: 1 }).estado).toBe("en-curso");
    expect(resultadoReto(reto, { estado: "repasar", vioSolucion: true }).puntos).toBe(0);
    const r = resultadoReto(reto, { estado: "resuelto", resueltoEn: "2026-11-16T10:20:00.000Z", pistasVistas: 2 }, 2);
    expect(r).toEqual({ estado: "resuelto", segundos: 1200, pistas: 1, puntos: 300 - 60 - 40 });
  });

  test("un ejercicio resuelto antes de empezar el reto no cuenta", () => {
    const reto = { inicio: "2026-11-16T10:00:00.000Z" };
    expect(resultadoReto(reto, { estado: "resuelto", resueltoEn: "2026-11-10T10:00:00.000Z" }).estado).toBe("en-curso");
  });

  test("marca personal: la semana con más puntos", () => {
    const m = marcaPersonal({
      "2026-11-02": { id: "b", puntos: 180 },
      "2026-11-09": { id: "c", puntos: 420 },
      "2026-11-16": { id: "d", puntos: 0 },
    });
    expect(m.mejor).toMatchObject({ semana: "2026-11-09", puntos: 420 });
    expect(m.hechos).toBe(2);
  });
});

describe("plan de la semana", () => {
  test("arma objetivos con lo débil, el error más común y lo que piden las ofertas", () => {
    const plan = planDeLaSemana({
      debiles: [
        { id: "closures", titulo: "Closures", area: "javascript", estado: "rojo" },
        { id: "alg-x", titulo: "Pilas", area: "algoritmos", estado: "amarillo" },
      ],
      errores: [{ categoria: "undefined", nombre: "Leer algo de undefined", veces: 7 }],
      ofertas: [
        {
          tecnologias: [
            { nombre: "TypeScript", estado: "en-progreso" },
            { nombre: "React", estado: "dominas" },
          ],
        },
        {
          tecnologias: [
            { nombre: "TypeScript", estado: "por-empezar" },
            { nombre: "Git", estado: "no-esta" },
          ],
        },
      ],
      reto: { id: "c", titulo: "Un reto" },
      tarjetasPendientes: 4,
      meta: 2,
    });
    const ids = plan.map((p) => p.id);
    expect(ids).toEqual([
      "meta",
      "unidad-closures",
      "unidad-alg-x",
      "error-undefined",
      "oferta-TypeScript",
      "reto",
      "tarjetas",
      "simulacro",
    ]);
    expect(plan.find((p) => p.id === "unidad-alg-x").a).toContain("algoritmos");
    expect(plan.find((p) => p.id === "oferta-TypeScript").detalle).toContain("2 ofertas");
  });

  test("sin datos queda un plan mínimo", () => {
    expect(planDeLaSemana({}).map((p) => p.id)).toEqual(["meta", "simulacro"]);
  });
});
