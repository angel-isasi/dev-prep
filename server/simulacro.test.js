import { describe, expect, test } from "vitest";
import { armarProceso, minutosProceso, planRefuerzo } from "./simulacro.js";

const proceso = {
  etapas: [
    { id: "rrhh", titulo: "RR. HH.", minutos: 15 },
    { id: "tecnica", titulo: "Técnica", minutos: 45 },
    { id: "proyecto", titulo: "Proyecto", minutos: 15 },
    { id: "cierre", titulo: "Cierre", minutos: 5 },
  ],
  repreguntas: [
    { id: "rep-01", pregunta: "¿Y si viene vacío?" },
    { id: "rep-02", pregunta: "¿Complejidad?" },
    { id: "rep-03", pregunta: "¿Cómo lo pruebas?" },
  ],
  preguntasParaElEntrevistador: ["¿Cómo es el primer mes?"],
};

const tarjeta = (id, etapa, categoria = etapa, progreso = null) => ({
  id,
  etapa,
  categoria,
  pregunta: id,
  progreso,
});
const tarjetas = [
  ...["r1", "r2", "r3", "r4"].map((id) => tarjeta(id, "rrhh")),
  ...["t1", "t2", "t3", "t4", "t5"].map((id) => tarjeta(id, "tecnica", "JavaScript")),
  ...["p1", "p2", "p3", "p4"].map((id) => tarjeta(id, "proyecto")),
];
const ejercicios = [
  { id: "ej-1", titulo: "Uno", estado: "resuelto" },
  { id: "ej-2", titulo: "Dos", estado: "pendiente" },
];
const azarFijo = () => 0;

describe("armarProceso", () => {
  test("el proceso completo sigue el orden real y cada etapa empieza con su portada", () => {
    const pasos = armarProceso({
      tarjetas,
      ejercicios,
      proceso,
      azar: azarFijo,
    });
    const portadas = pasos.filter((p) => p.tipo === "etapa").map((p) => p.etapa);
    expect(portadas).toEqual(["rrhh", "tecnica", "proyecto", "cierre"]);
    expect(pasos.filter((p) => p.etapa === "rrhh" && p.tipo === "pregunta")).toHaveLength(3);
    expect(pasos.filter((p) => p.etapa === "proyecto" && p.tipo === "pregunta")).toHaveLength(3);
    expect(pasos.some((p) => p.tipo === "pitch")).toBe(true);
    expect(pasos.at(-1).tipo).toBe("tus-preguntas");
  });

  test("cada etapa usa solo sus preguntas", () => {
    const pasos = armarProceso({
      tarjetas,
      ejercicios,
      proceso,
      azar: Math.random,
    });
    for (const p of pasos.filter((x) => x.tipo === "pregunta")) expect(p.p.etapa).toBe(p.etapa);
  });

  test("la técnica pone el ejercicio sin resolver y dos repreguntas justo después", () => {
    const pasos = armarProceso({
      tarjetas,
      ejercicios,
      proceso,
      etapas: ["tecnica"],
      azar: azarFijo,
    });
    const tipos = pasos.map((p) => p.tipo);
    expect(tipos).toEqual(["etapa", "pregunta", "pregunta", "ejercicio", "repregunta", "repregunta", "pregunta"]);
    expect(pasos.find((p) => p.tipo === "ejercicio").ej.id).toBe("ej-2");
  });

  test("se puede hacer una etapa suelta", () => {
    const pasos = armarProceso({
      tarjetas,
      ejercicios,
      proceso,
      etapas: ["proyecto"],
      azar: azarFijo,
    });
    expect(new Set(pasos.map((p) => p.etapa))).toEqual(new Set(["proyecto"]));
  });

  test("prefiere las preguntas que no dominas", () => {
    const conDominadas = [
      tarjeta("r1", "rrhh", "rrhh", { caja: 5 }),
      tarjeta("r2", "rrhh", "rrhh", { caja: 4 }),
      tarjeta("r3", "rrhh"),
      tarjeta("r4", "rrhh", "rrhh", { caja: 1 }),
    ];
    const pasos = armarProceso({
      tarjetas: conDominadas,
      ejercicios,
      proceso,
      etapas: ["rrhh"],
      azar: azarFijo,
    });
    const ids = pasos.filter((p) => p.tipo === "pregunta").map((p) => p.p.id);
    expect(ids.slice(0, 2).sort()).toEqual(["r3", "r4"]);
  });

  test("sin ejercicios ni preguntas no se rompe", () => {
    const pasos = armarProceso({
      tarjetas: [],
      ejercicios: [],
      proceso: null,
      etapas: ["tecnica", "cierre"],
    });
    expect(pasos.map((p) => p.tipo)).toEqual(["etapa", "etapa", "tus-preguntas"]);
  });

  test("minutos del proceso según las etapas", () => {
    expect(minutosProceso(proceso)).toBe(80);
    expect(minutosProceso(proceso, ["rrhh", "cierre"])).toBe(20);
  });
});

describe("planRefuerzo", () => {
  const pasos = armarProceso({ tarjetas, ejercicios, proceso, azar: azarFijo });
  const comunicacionTotal = [
    { id: "plan", texto: "Expliqué mi plan" },
    { id: "probar", texto: "Probé mi solución" },
  ];

  test("todo bien y comunicación completa: plan vacío", () => {
    const resultados = pasos.map((p) =>
      p.tipo === "ejercicio" ? "hecho" : p.tipo === "etapa" || p.tipo === "tus-preguntas" ? null : "sabia",
    );
    expect(
      planRefuerzo(pasos, resultados, {
        comunicacion: ["plan", "probar"],
        comunicacionTotal,
        tusPreguntas: 2,
      }),
    ).toEqual([]);
  });

  test("ordena las categorías por cuánto fallaste y agrega ejercicio, pitch y comunicación", () => {
    const resultados = pasos.map((p) => {
      if (p.tipo === "ejercicio") return "no-llegue";
      if (p.tipo === "pitch") return "dude";
      if (p.tipo === "pregunta" && p.etapa === "tecnica") return "dude";
      if (p.tipo === "pregunta" && p.etapa === "rrhh") return "no";
      if (p.tipo === "repregunta") return "sabia";
      return p.tipo === "pregunta" ? "sabia" : null;
    });
    const plan = planRefuerzo(pasos, resultados, {
      comunicacion: ["plan"],
      comunicacionTotal,
      tusPreguntas: 0,
    });
    expect(plan.map((x) => x.tipo)).toEqual(["mazo", "mazo", "ejercicio", "pitch", "voz-alta", "tus-preguntas"]);
    expect(plan[0].categoria).toBe("rrhh");
    expect(plan[1].categoria).toBe("JavaScript");
    expect(plan[2].id).toBe("ej-2");
    expect(plan[4].texto).toContain("probé mi solución");
  });

  test("las repreguntas falladas se vuelven una costumbre para revisar", () => {
    const resultados = pasos.map((p) => (p.tipo === "repregunta" ? "no" : p.tipo === "ejercicio" ? "hecho" : "sabia"));
    const plan = planRefuerzo(pasos, resultados, { tusPreguntas: 3 });
    expect(plan).toHaveLength(1);
    expect(plan[0].tipo).toBe("repreguntas");
  });
});

describe("elegirPreguntas (entrevista por voz)", async () => {
  const { elegirPreguntas, TODAS_LAS_ETAPAS } = await import("./simulacro.js");
  const tarjetas = [
    ...[1, 2, 3].map((n) => ({ id: `rh-${n}`, etapa: "rrhh", pregunta: `rh ${n}` })),
    ...[1, 2, 3, 4].map((n) => ({ id: `tec-${n}`, pregunta: `tec ${n}`, ...(n === 1 ? { preguntaEn: "tec 1 en" } : {}) })), // sin etapa: técnica
    ...[1, 2].map((n) => ({ id: `pro-${n}`, etapa: "proyecto", pregunta: `pro ${n}` })),
  ];
  const sinAzar = () => 0;

  test("de una etapa trae solo esa etapa y la cantidad pedida", () => {
    const r = elegirPreguntas(tarjetas, { etapa: "tecnica", cantidad: 3 }, sinAzar);
    expect(r).toHaveLength(3);
    expect(r.every((p) => p.id.startsWith("tec-"))).toBe(true);
  });

  test("un poco de todo: empieza recursos humanos, sigue lo técnico y cierra el proyecto", () => {
    const r = elegirPreguntas(tarjetas, { etapa: TODAS_LAS_ETAPAS, cantidad: 5 }, sinAzar).map((p) => p.id.split("-")[0]);
    expect(r).toEqual(["rh", "tec", "tec", "tec", "pro"]);
    expect(elegirPreguntas(tarjetas, { etapa: TODAS_LAS_ETAPAS, cantidad: 3 }, sinAzar).map((p) => p.id.split("-")[0])).toEqual(["rh", "tec", "pro"]);
  });

  test("en inglés prefiere las traducidas, y si no hay usa las demás", () => {
    expect(elegirPreguntas(tarjetas, { etapa: "tecnica", cantidad: 3, ingles: true }, sinAzar).map((p) => p.id)).toEqual(["tec-1"]);
    expect(elegirPreguntas(tarjetas, { etapa: "rrhh", cantidad: 2, ingles: true }, sinAzar)).toHaveLength(2);
  });
});
