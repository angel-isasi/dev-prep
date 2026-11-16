import { describe, expect, test } from "vitest";
import { diasCombinados, documentoParaSubir, fechaDe, fusionarDocumento, masReciente } from "./combinar.js";

const laptop = () => ({
  version: 1,
  config: { metaDiaria: 2, nombre: "Angel", tema: "oscuro", actualizadoEn: "2026-11-10T10:00:00-05:00" },
  preguntas: { p1: { caja: 2, proximo: "2026-11-18", ultima: "sabia", vistas: 2, en: "2026-11-15T09:00:00-05:00" } },
  quizzes: { arrays: { mejor: 4, total: 6, ultimo: 4, en: "2026-11-14T10:00:00-05:00" } },
  ejercicios: { e1: { estado: "resuelto", intentos: 3, ultimaActividad: "2026-11-14T20:00:00-05:00" } },
  dias: { "2026-11-15": { resueltos: 1, repasos: 0, preguntas: 1, segundos: 600 } },
});

const celular = () => ({
  version: 1,
  config: { metaDiaria: 2, nombre: "Angel", tema: "claro", actualizadoEn: "2026-11-01T10:00:00-05:00" },
  preguntas: {
    p1: { caja: 3, proximo: "2026-11-22", ultima: "sabia", vistas: 3, en: "2026-11-15T13:00:00-05:00" },
    p2: { caja: 1, proximo: "2026-11-16", ultima: "no", vistas: 1, en: "2026-11-15T13:05:00-05:00" },
  },
  quizzes: { arrays: { mejor: 3, total: 6, ultimo: 3, en: "2026-11-15T12:00:00-05:00" } },
  items: { "quiz:arrays:0": { caja: 1, proximo: "2026-11-16", en: "2026-11-15T12:00:00-05:00" } },
  lecturas: { e2: { pistasVistas: 1, vioSolucion: true, caja: 1, en: "2026-11-15T12:30:00-05:00" } },
  lecciones: { xp: 140, completadas: 2 },
  dias: { "2026-11-15": { preguntas: 2, lecciones: 1, lecturas: 1 } },
});

describe("masReciente", () => {
  test("gana el de fecha más nueva aunque las zonas horarias difieran", () => {
    const a = { en: "2026-11-15T10:00:00-05:00" }; // 15:00 UTC
    const b = { en: "2026-11-15T14:30:00Z" }; // 14:30 UTC: es más vieja
    expect(masReciente(a, b)).toBe(a);
  });
  test("sin fechas, gana el de más uso", () => {
    expect(masReciente({ vistas: 1 }, { vistas: 4 }).vistas).toBe(4);
  });
  test("si falta uno, devuelve el otro", () => {
    expect(masReciente(undefined, { en: "x" })).toEqual({ en: "x" });
    expect(fechaDe({ en: "no es fecha" })).toBeNull();
  });
});

describe("fusionarDocumento", () => {
  test("tarjetas: gana lo más reciente y llegan las nuevas", () => {
    const r = fusionarDocumento(laptop(), celular(), "celular");
    expect(r.preguntas.p1.caja).toBe(3);
    expect(r.preguntas.p2.ultima).toBe("no");
  });

  test("quizzes: se queda el mejor resultado", () => {
    const r = fusionarDocumento(laptop(), celular(), "celular");
    expect(r.quizzes.arrays.mejor).toBe(4);
    expect(r.quizzes.arrays.ultimo).toBe(3); // el último es el más reciente (del celular)
  });

  test("llegan los ítems de lección, las lecturas y las lecciones del celular", () => {
    const r = fusionarDocumento(laptop(), celular(), "celular");
    expect(r.items["quiz:arrays:0"].caja).toBe(1);
    expect(r.lecturas.e2.vioSolucion).toBe(true);
    expect(r.lecciones.xp).toBe(140);
  });

  test("un ejercicio resuelto en la laptop no se pierde aunque el otro registro sea más nuevo", () => {
    const otro = { ...celular(), ejercicios: { e1: { estado: "en-progreso", ultimaActividad: "2026-11-15T23:00:00-05:00" } } };
    const r = fusionarDocumento(laptop(), otro, "celular");
    expect(r.ejercicios.e1.estado).toBe("resuelto");
  });

  test("la config más vieja no pisa la nueva y el tema es de cada dispositivo", () => {
    const r = fusionarDocumento(laptop(), celular(), "celular");
    expect(r.config.tema).toBe("oscuro");
    const nueva = { ...celular(), config: { ...celular().config, nombre: "Angel Isasi", actualizadoEn: "2026-11-15T20:00:00-05:00" } };
    const r2 = fusionarDocumento(laptop(), nueva, "celular");
    expect(r2.config.nombre).toBe("Angel Isasi");
    expect(r2.config.tema).toBe("oscuro");
  });

  test("los días del otro dispositivo se guardan aparte y se suman", () => {
    const r = fusionarDocumento(laptop(), celular(), "celular");
    expect(r.dias["2026-11-15"].preguntas).toBe(1); // lo propio no cambia
    expect(diasCombinados(r)["2026-11-15"]).toMatchObject({ resueltos: 1, preguntas: 3, lecciones: 1, segundos: 600 });
  });

  test("mezclar dos veces lo mismo da el mismo resultado (sincronizar de nuevo no duplica)", () => {
    const una = fusionarDocumento(laptop(), celular(), "celular");
    const dos = fusionarDocumento(una, celular(), "celular");
    expect(dos).toEqual(una);
    expect(diasCombinados(dos)).toEqual(diasCombinados(una));
  });

  test("ida y vuelta: los dos dispositivos terminan con los mismos registros", () => {
    const enLaptop = fusionarDocumento(laptop(), documentoParaSubir(celular()), "celular");
    const enCelular = fusionarDocumento(celular(), documentoParaSubir(laptop()), "laptop");
    expect(enCelular.preguntas).toEqual(enLaptop.preguntas);
    expect(enCelular.ejercicios).toEqual(enLaptop.ejercicios);
    expect(diasCombinados(enCelular)).toEqual(diasCombinados(enLaptop));
  });

  test("un documento remoto vacío o inválido no rompe nada", () => {
    expect(fusionarDocumento(laptop(), null, "x")).toEqual(laptop());
    const r = fusionarDocumento(laptop(), {}, "x");
    expect(r.preguntas).toEqual(laptop().preguntas);
  });
});

describe("textos personales y configuración", () => {
  test("un dispositivo sin pitch recibe el del otro aunque no tenga fecha", () => {
    const conPitch = { ...laptop(), misRespuestas: { pitch: "Hola, soy Angel", historias: [] } };
    const r = fusionarDocumento(celular(), conPitch, "laptop");
    expect(r.misRespuestas.pitch).toBe("Hola, soy Angel");
  });
  test("un pitch propio no se pisa con uno más viejo", () => {
    const propio = { ...celular(), misRespuestas: { pitch: "nuevo", historias: [], actualizadoEn: "2026-11-15T20:00:00-05:00" } };
    const viejo = { ...laptop(), misRespuestas: { pitch: "viejo", historias: [], actualizadoEn: "2026-11-10T20:00:00-05:00" } };
    expect(fusionarDocumento(propio, viejo, "laptop").misRespuestas.pitch).toBe("nuevo");
  });
  test("la config con fecha de la laptop manda sobre la config por defecto (sin fecha) de un celular nuevo", () => {
    const nuevo = { version: 1, config: { metaDiaria: 2, nombre: "" } };
    expect(fusionarDocumento(nuevo, laptop(), "laptop").config.nombre).toBe("Angel");
    expect(fusionarDocumento(laptop(), nuevo, "celular").config.nombre).toBe("Angel");
  });
});

describe("documentoParaSubir", () => {
  test("no sube lo que bajó de otros ni la lección a medias", () => {
    const doc = { ...celular(), diasRemotos: { laptop: {} }, leccionEnCurso: { pasos: [] } };
    const subir = documentoParaSubir(doc);
    expect(subir.diasRemotos).toBeUndefined();
    expect(subir.leccionEnCurso).toBeUndefined();
    expect(subir.dias).toEqual(celular().dias);
  });
});
