import { describe, expect, test } from "vitest";
import { CLAVE, crearProgresoMovil, rachaMovil } from "./progreso-movil.js";

/** Un localStorage falso, en memoria. */
function almacenFalso(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  return {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    datos,
  };
}

const reloj = (hoy) => ({ hoy: () => hoy, ahora: () => `${hoy}T10:00:00-05:00` });

describe("progreso del celular", () => {
  test("empieza vacío y guarda en localStorage", () => {
    const almacen = almacenFalso();
    const p = crearProgresoMovil(almacen, reloj("2026-11-15"));
    expect(p.datos().lecturas).toEqual({});
    p.calificarPregunta("ent-001", "sabia");
    expect(JSON.parse(almacen.getItem(CLAVE)).preguntas["ent-001"].caja).toBe(1);
  });

  test("al recargar recupera lo guardado", () => {
    const almacen = almacenFalso();
    crearProgresoMovil(almacen, reloj("2026-11-15")).guardarQuiz("arrays", 5, 6);
    const otra = crearProgresoMovil(almacen, reloj("2026-11-15"));
    expect(otra.datos().quizzes.arrays).toMatchObject({ mejor: 5, total: 6, ultimo: 5 });
  });

  test("si el JSON está dañado empieza de cero y guarda una copia aparte", () => {
    const almacen = almacenFalso({ [CLAVE]: "{roto" });
    const p = crearProgresoMovil(almacen, reloj("2026-11-15"));
    expect(p.datos().preguntas).toEqual({});
    expect(almacen.getItem("devprep-movil-danado")).toBe("{roto");
  });

  test("tarjeta: guarda la fecha y hora (para sincronizar) y suma al día", () => {
    const p = crearProgresoMovil(almacenFalso(), reloj("2026-11-15"));
    const r = p.calificarPregunta("ent-002", "no");
    expect(r).toMatchObject({ caja: 1, proximo: "2026-11-16", ultima: "no", vistas: 1, en: "2026-11-15T10:00:00-05:00" });
    expect(p.datos().dias["2026-11-15"].preguntas).toBe(1);
  });

  test("pistas: en orden; saltarse una devuelve null; repetir una ya vista no cambia nada", () => {
    const p = crearProgresoMovil(almacenFalso(), reloj("2026-11-15"));
    expect(p.verPista("js-ej-001", 2)).toBeNull();
    expect(p.verPista("js-ej-001", 1).pistasVistas).toBe(1);
    expect(p.verPista("js-ej-001", 1).pistasVistas).toBe(1);
    expect(p.verPista("js-ej-001", 2).pistasVistas).toBe(2);
  });

  test("ver la solución no penaliza; la autoevaluación agenda el repaso", () => {
    const p = crearProgresoMovil(almacenFalso(), reloj("2026-11-15"));
    expect(p.estadoLectura("js-ej-001")).toBe("pendiente");
    p.verSolucion("js-ej-001");
    expect(p.estadoLectura("js-ej-001")).toBe("pendiente"); // solo mirar no cuenta como estudiado
    p.autoevaluar("js-ej-001", "sabia");
    expect(p.estadoLectura("js-ej-001")).toBe("estudiado");
    expect(p.deLectura("js-ej-001")).toMatchObject({ vioSolucion: true, caja: 1, proximo: "2026-11-16" });
    // al día siguiente toca repasarlo
    const manana = crearProgresoMovil(
      { getItem: () => p.exportar(), setItem: () => {} },
      reloj("2026-11-16"),
    );
    expect(manana.estadoLectura("js-ej-001")).toBe("repasar");
  });

  test("importar un respaldo inválido no toca nada", () => {
    const p = crearProgresoMovil(almacenFalso(), reloj("2026-11-15"));
    p.guardarQuiz("arrays", 3, 6);
    expect(() => p.importar("no es json")).toThrow();
    expect(() => p.importar('{"hola":1}')).toThrow("No parece un respaldo");
    expect(p.datos().quizzes.arrays.mejor).toBe(3);
  });

  test("exportar e importar conserva todo", () => {
    const a = crearProgresoMovil(almacenFalso(), reloj("2026-11-15"));
    a.calificarPregunta("ent-003", "dude");
    a.guardarMisRespuestas({ pitch: "Hola", historias: [], respuestas: {} });
    const b = crearProgresoMovil(almacenFalso(), reloj("2026-11-15"));
    b.importar(a.exportar());
    expect(b.datos().preguntas["ent-003"].ultima).toBe("dude");
    expect(b.datos().misRespuestas.pitch).toBe("Hola");
  });
});

describe("racha del celular", () => {
  test("cuenta días seguidos con algo estudiado, terminando hoy o ayer", () => {
    const dias = {
      "2026-11-12": { preguntas: 2 },
      "2026-11-13": { quizzes: 1 },
      "2026-11-14": { lecturas: 1 },
    };
    expect(rachaMovil(dias, "2026-11-15")).toBe(3); // hoy aún no estudió: cuenta hasta ayer
    expect(rachaMovil({ ...dias, "2026-11-15": { preguntas: 1 } }, "2026-11-15")).toBe(4);
    expect(rachaMovil(dias, "2026-11-16")).toBe(0); // ayer (15) no estudió
  });
});
