import { describe, expect, test } from "vitest";
import {
  conFechaDeEnvio,
  diasEntre,
  fechaDeEnvio,
  mensajePostulacion,
  mensajeSeguimiento,
  metaSemanal,
  numerosPostulaciones,
  seguimientosParaAvisar,
  seguimientosPendientes,
} from "./postulaciones.js";

const HOY = "2026-11-18"; // miércoles

describe("fecha de envío", () => {
  test("se anota al salir de 'Por postular' y no cambia después", () => {
    expect(conFechaDeEnvio({ etapa: "por-postular" }, HOY).enviadaEl).toBeUndefined();
    expect(conFechaDeEnvio({ etapa: "enviada" }, HOY).enviadaEl).toBe(HOY);
    expect(conFechaDeEnvio({ etapa: "entrevista", enviadaEl: "2026-11-01" }, HOY).enviadaEl).toBe("2026-11-01");
  });
  test("las antiguas sin enviadaEl usan su fecha de creación", () => {
    expect(fechaDeEnvio({ etapa: "enviada", fecha: "2026-10-01" })).toBe("2026-10-01");
    expect(fechaDeEnvio({ etapa: "por-postular", fecha: "2026-10-01" })).toBeNull();
  });
  test("días entre dos fechas", () => {
    expect(diasEntre("2026-11-11", HOY)).toBe(7);
    expect(diasEntre("2026-10-31", "2026-11-01")).toBe(1);
  });
});

describe("seguimiento a los 7 días", () => {
  const lista = [
    { id: "a", empresa: "Acme", etapa: "enviada", enviadaEl: "2026-11-11" }, // 7 días
    { id: "b", empresa: "Beta", etapa: "enviada", enviadaEl: "2026-11-15" }, // 3 días: todavía no
    { id: "c", empresa: "Gama", etapa: "entrevista", enviadaEl: "2026-10-01" }, // ya respondieron
    { id: "d", empresa: "Delta", etapa: "enviada", enviadaEl: "2026-10-20", seguimientoEl: "2026-11-09", seguimientos: 1 }, // 9 días desde el seguimiento
  ];
  test("solo las enviadas con 7 días o más sin respuesta, contando desde tu último seguimiento", () => {
    const p = seguimientosPendientes(lista, HOY);
    expect(p.map((x) => [x.id, x.dias, x.seguimientos])).toEqual([
      ["d", 9, 1],
      ["a", 7, 0],
    ]);
  });
  test("el aviso al celular sale solo el día 7, 14 y 21 (no todos los días)", () => {
    expect(seguimientosParaAvisar(lista, HOY).map((x) => x.id)).toEqual(["a"]);
    expect(seguimientosParaAvisar(lista, "2026-11-19")).toEqual([]);
    expect(seguimientosParaAvisar(lista, "2026-11-25").map((x) => x.id)).toEqual(["a"]);
    expect(seguimientosParaAvisar(lista, "2026-12-09")).toEqual([]); // 28 días: ya no insiste
  });
});

describe("tus números", () => {
  const lista = [
    { etapa: "enviada", enviadaEl: "2026-11-16", fuente: "LinkedIn" },
    { etapa: "entrevista", enviadaEl: "2026-11-10", fuente: "Get on Board" },
    { etapa: "rechazo", enviadaEl: "2026-11-02", fuente: "LinkedIn" },
    { etapa: "sin-respuesta", enviadaEl: "2026-10-01" },
    { etapa: "por-postular", fecha: "2026-11-17" },
  ];
  test("cuenta solo las enviadas; un 'no' también es respuesta", () => {
    const n = numerosPostulaciones(lista, HOY);
    expect([n.total, n.respondieron, n.tasa, n.esperando]).toEqual([4, 2, 50, 1]);
  });
  test("por semana: 8 semanas, la última es esta", () => {
    const { porSemana } = numerosPostulaciones(lista, HOY);
    expect(porSemana).toHaveLength(8);
    expect(porSemana.at(-1)).toEqual({ semana: "2026-11-16", cantidad: 1 });
    expect(porSemana.at(-2)).toEqual({ semana: "2026-11-09", cantidad: 1 });
    expect(porSemana.at(-3)).toEqual({ semana: "2026-11-02", cantidad: 1 });
  });
  test("por fuente: primero la que más te responde", () => {
    expect(numerosPostulaciones(lista, HOY).porFuente).toEqual([
      { fuente: "Get on Board", enviadas: 1, respondieron: 1 },
      { fuente: "LinkedIn", enviadas: 2, respondieron: 1 },
      { fuente: "Sin fuente", enviadas: 1, respondieron: 0 },
    ]);
  });
  test("sin postulaciones, la tasa es null", () => {
    expect(numerosPostulaciones([], HOY).tasa).toBeNull();
  });
});

test("meta semanal: cuenta las enviadas desde el lunes", () => {
  const lista = [
    { etapa: "enviada", enviadaEl: "2026-11-16" },
    { etapa: "entrevista", enviadaEl: "2026-11-17" },
    { etapa: "enviada", enviadaEl: "2026-11-15" }, // domingo pasado: otra semana
    { etapa: "por-postular", fecha: HOY },
  ];
  expect(metaSemanal(lista, HOY, 3)).toEqual({ meta: 3, hechas: 2, cumplida: false, faltan: 1 });
  expect(metaSemanal(lista, HOY, 2).cumplida).toBe(true);
  expect(metaSemanal(lista, HOY, 0).cumplida).toBe(false); // apagada
});

describe("mensajes", () => {
  const cv = { nombre: "Ana Pérez", github: "https://github.com/ana", proyectos: [{ titulo: "dev-prep", enlace: "https://dev-prep.test", descripcion: "" }] };
  const tecnologias = [
    { nombre: "React", estado: "dominas" },
    { nombre: "TypeScript", estado: "por-empezar" },
    { nombre: "Asincronía (promesas, async/await)", estado: "en-progreso" },
    { nombre: "Inglés", estado: "dominas" },
  ];
  test("postular en español: empresa, puesto, lo que sabes (no lo que no sabes) y tu proyecto", () => {
    const m = mensajePostulacion({ empresa: "Acme", puesto: "Frontend Jr", tecnologias, cv });
    expect(m).toContain("Hola, equipo de Acme:");
    expect(m).toContain("Vi la oferta de Frontend Jr");
    expect(m).toContain("Trabajo con React y Asincronía.");
    expect(m).not.toContain("TypeScript");
    expect(m).toContain("construí dev-prep (https://dev-prep.test)");
    expect(m).toContain("Mis proyectos están en https://github.com/ana");
    expect(m.trim().endsWith("Ana Pérez")).toBe(true);
  });
  test("postular en inglés y sin CV: deja marcas para completar", () => {
    const m = mensajePostulacion({ empresa: "", puesto: "", tecnologias: [], cv: {}, idioma: "en" });
    expect(m).toContain("Hi [company] team,");
    expect(m).toContain("working with JavaScript and React.");
    expect(m).toContain("[your name]");
  });
  test("seguimiento", () => {
    expect(mensajeSeguimiento({ empresa: "Acme", puesto: "Frontend Jr" })).toContain("postulé al puesto de Frontend Jr en Acme");
    expect(mensajeSeguimiento({ empresa: "Acme" }, "en")).toContain("applied for the [role] role at Acme");
  });
});
