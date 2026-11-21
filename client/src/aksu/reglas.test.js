import { describe, expect, it } from "vitest";
import {
  actividad, anotar, anotarGuardada, anotarResuelto, diaNuevo, estaTrabado, lunesDe, marcar, marcarFrenado, marcarHecho, marcarPausa, marcarPregunta, marcarTrabado,
  pasoElTiempo, puede, sesionNueva, sigueAhi, tocaCierre, tocaInforme, tocaPausa, tocaPregunta, tocaSorpresa, vaCorriendo,
} from "./reglas.js";

const MIN = 60_000;
const T0 = 1_000_000_000;
const falla = (...nombres) => ({ casos: [{ nombre: "ok", ok: true }, ...nombres.map((nombre) => ({ nombre, ok: false }))] });

describe("niveles", () => {
  it("callado no interviene solo; encima hace más que normal", () => {
    expect(puede("callado", "trabado")).toBe(false);
    expect(puede("normal", "trabado")).toBe(true);
    expect(puede("normal", "test")).toBe(false);
    expect(puede("encima", "test")).toBe(true);
    expect(puede("otro", "pausa")).toBe(true);
  });
});

describe("trabado", () => {
  it("tres guardadas con el mismo fallo, y avisa una vez por fallo", () => {
    let s = sesionNueva("e1", 1, T0);
    s = anotarGuardada(s, falla("a"), T0);
    s = anotarGuardada(s, falla("a"), T0 + 1);
    expect(estaTrabado(s)).toBe(false);
    s = anotarGuardada(s, falla("a"), T0 + 2);
    expect(estaTrabado(s)).toBe(true);
    s = marcarTrabado(s);
    s = anotarGuardada(s, falla("a"), T0 + 3);
    expect(estaTrabado(s)).toBe(false);
    // otro fallo distinto, repetido: avisa de nuevo
    for (let i = 0; i < 3; i++) s = anotarGuardada(s, falla("b"), T0 + 10 + i);
    expect(estaTrabado(s)).toBe(true);
  });

  it("si cambia lo que falla o todo pasa, no está trabado", () => {
    let s = sesionNueva("e1", 1, T0);
    s = anotarGuardada(s, falla("a", "b"), T0);
    s = anotarGuardada(s, falla("a"), T0);
    s = anotarGuardada(s, falla("a"), T0);
    expect(estaTrabado(s)).toBe(false);
    let ok = sesionNueva("e2", 1, T0);
    for (let i = 0; i < 3; i++) ok = anotarGuardada(ok, falla(), T0);
    expect(estaTrabado(ok)).toBe(false);
  });

  it("un error al correr también cuenta", () => {
    let s = sesionNueva("e1", 1, T0);
    for (let i = 0; i < 3; i++) s = anotarGuardada(s, { error: "SyntaxError" }, T0);
    expect(estaTrabado(s)).toBe(true);
  });
});

describe("tiempo", () => {
  it("según el nivel del ejercicio, una sola vez", () => {
    const basico = sesionNueva("e1", 1, T0);
    expect(pasoElTiempo(basico, T0 + 19 * MIN)).toBe(false);
    expect(pasoElTiempo(basico, T0 + 20 * MIN)).toBe(true);
    expect(pasoElTiempo(marcar(basico, "tiempo"), T0 + 40 * MIN)).toBe(false);
    expect(pasoElTiempo(sesionNueva("e2", 3, T0), T0 + 45 * MIN)).toBe(false);
  });
});

describe("el día", () => {
  it("frena si 3 de los últimos 4 salieron con pistas o solución, y no insiste enseguida", () => {
    let d = diaNuevo("2026-11-21", T0);
    d = anotarResuelto(d, { id: "a", pistas: 3 }, T0);
    d = anotarResuelto(d, { id: "b", solucion: true }, T0);
    d = anotarResuelto(d, { id: "c", pistas: 0 }, T0);
    expect(vaCorriendo(d)).toBe(false);
    d = anotarResuelto(d, { id: "d", pistas: 2 }, T0);
    expect(vaCorriendo(d)).toBe(true);
    d = marcarFrenado(d);
    d = anotarResuelto(d, { id: "e", pistas: 2 }, T0);
    expect(vaCorriendo(d)).toBe(false);
  });

  it("no cuenta dos veces el mismo ejercicio", () => {
    let d = diaNuevo("2026-11-21", T0);
    d = anotarResuelto(d, { id: "a" }, T0);
    d = anotarResuelto(d, { id: "a" }, T0 + 1);
    expect(d.resueltos).toHaveLength(1);
  });

  it("pregunta de entrevista cada 3 resueltos", () => {
    let d = diaNuevo("2026-11-21", T0);
    for (const id of ["a", "b"]) d = anotarResuelto(d, { id }, T0);
    expect(tocaPregunta(d)).toBe(false);
    d = anotarResuelto(d, { id: "c" }, T0);
    expect(tocaPregunta(d)).toBe(true);
    d = marcarPregunta(d);
    expect(tocaPregunta(d)).toBe(false);
  });

  it("pausa a los 50 minutos seguidos, y el reloj vuelve a empezar tras un descanso", () => {
    let d = diaNuevo("2026-11-21", T0);
    for (let m = 5; m <= 49; m += 4) d = actividad(d, T0 + m * MIN); // trabajando sin parar
    expect(tocaPausa(d, T0 + 49 * MIN)).toBe(false);
    d = actividad(d, T0 + 51 * MIN);
    expect(tocaPausa(d, T0 + 51 * MIN)).toBe(true);
    d = marcarPausa(d, T0 + 51 * MIN);
    expect(tocaPausa(d, T0 + 60 * MIN)).toBe(false);
    // 15 minutos sin tocar nada: al volver, cuenta desde cero
    d = actividad(d, T0 + 80 * MIN);
    expect(d.activoDesde).toBe(T0 + 80 * MIN);
  });

  it("¿sigues ahí? a los 20 minutos sin actividad con un ejercicio abierto", () => {
    const d = diaNuevo("2026-11-21", T0);
    const s = sesionNueva("e1", 1, T0);
    expect(sigueAhi(null, d, T0 + 30 * MIN)).toBe(false);
    expect(sigueAhi(s, d, T0 + 19 * MIN)).toBe(false);
    expect(sigueAhi(s, d, T0 + 20 * MIN)).toBe(true);
    expect(sigueAhi(marcar(s, "inactivo"), d, T0 + 30 * MIN)).toBe(false);
    expect(sigueAhi(anotarGuardada(s, falla("a"), T0 + 15 * MIN), d, T0 + 25 * MIN)).toBe(false);
  });

  it("cierre de noche si hubo trabajo, y sorpresa a la media hora, una vez", () => {
    let d = diaNuevo("2026-11-21", T0);
    expect(tocaCierre(d, 22)).toBe(false);
    d = anotarResuelto(d, { id: "a" }, T0);
    expect(tocaCierre(d, 20)).toBe(false);
    expect(tocaCierre(d, 21)).toBe(true);
    expect(tocaCierre(marcarHecho(d, "cierre"), 23)).toBe(false);
    expect(tocaSorpresa(d, T0 + 29 * MIN)).toBe(false);
    expect(tocaSorpresa(d, T0 + 30 * MIN)).toBe(true);
    expect(tocaSorpresa(marcarHecho(d, "sorpresa"), T0 + 90 * MIN)).toBe(false);
  });
});

describe("informe semanal", () => {
  it("toca el domingo (o el lunes siguiente) una vez por semana", () => {
    expect(lunesDe("2026-11-22")).toBe("2026-11-16"); // domingo
    expect(tocaInforme("2026-11-22", null)).toBe("2026-11-16");
    expect(tocaInforme("2026-11-23", null)).toBe("2026-11-16"); // lunes: la semana que acaba de cerrar
    expect(tocaInforme("2026-11-23", "2026-11-16")).toBeNull();
    expect(tocaInforme("2026-11-25", null)).toBeNull(); // miércoles
  });
});

describe("cuaderno", () => {
  it("guarda notas cortas sin repetir y con tope", () => {
    let c = anotar([], "Se confunde con sort sin comparador", "2026-11-21");
    c = anotar(c, "se confunde con SORT sin comparador", "2026-11-22");
    c = anotar(c, "  ", "2026-11-22");
    expect(c).toHaveLength(1);
    for (let i = 0; i < 60; i++) c = anotar(c, `nota ${i}`, "2026-11-22");
    expect(c).toHaveLength(40);
    expect(c.at(-1).texto).toBe("nota 59");
  });
});

import {
  bloqueActivo, enFranjaIngles, enSilencio, encajar, esDePaso, guardarVeredicto, juntoA, masLejana, notaDelDia, paradas, recibimiento, restanteBloque, siguienteParada, subirA, tocaDistraccion,
  tocaEntrevista, tocaRelampago, FIGURA,
} from "./reglas.js";

describe("Aksu: reglas nuevas", () => {
  const MINUTO = 60_000;

  it("silencio y bloque de concentración", () => {
    expect(enSilencio({ silencioHasta: 1000 }, 500)).toBe(true);
    expect(enSilencio({}, 500)).toBe(false);
    const bloque = { inicio: 0, minutos: 50 };
    expect(bloqueActivo(bloque, 49 * MINUTO)).toBe(true);
    expect(bloqueActivo(bloque, 50 * MINUTO)).toBe(false);
    expect(bloqueActivo(null, 0)).toBe(false);
    expect(restanteBloque(bloque, 20 * MINUTO)).toBe(30 * MINUTO);
  });

  it("distracción: 2 minutos en un bloque, 30 fuera, y una sola vez por cosa", () => {
    const yt = (minutos) => ({ nombre: "YouTube", tipo: "distraccion", minutos });
    expect(tocaDistraccion(yt(2), true, null)).toBe(true);
    expect(tocaDistraccion(yt(2), false, null)).toBe(false);
    expect(tocaDistraccion(yt(31), false, null)).toBe(true);
    expect(tocaDistraccion(yt(31), false, "YouTube")).toBe(false);
    expect(tocaDistraccion({ nombre: "VS Code", tipo: "estudio", minutos: 90 }, true, null)).toBe(false);
    expect(tocaDistraccion(null, true, null)).toBe(false);
  });

  it("entrevista sorpresa: una vez al día, tras 45 minutos y solo si no estás ocupado", () => {
    const dia = { activoDesde: 0, ultimaActividad: 46 * MINUTO, hechos: {} };
    expect(tocaEntrevista(dia, 46 * MINUTO, false)).toBe(true);
    expect(tocaEntrevista(dia, 46 * MINUTO, true)).toBe(false);
    expect(tocaEntrevista({ ...dia, hechos: { entrevista: true } }, 46 * MINUTO, false)).toBe(false);
    expect(tocaEntrevista({ ...dia, ultimaActividad: 0 }, 46 * MINUTO, false)).toBe(false);
    expect(tocaEntrevista(dia, 30 * MINUTO, false)).toBe(false);
  });

  it("reto relámpago: 2 minutos paseando, con actividad, y no más de uno cada 40 minutos", () => {
    const dia = { ultimaActividad: 10 * MINUTO };
    expect(tocaRelampago(dia, 10 * MINUTO, 8 * MINUTO)).toBe(true);
    expect(tocaRelampago(dia, 10 * MINUTO, 9 * MINUTO)).toBe(false);
    expect(tocaRelampago(dia, 10 * MINUTO, null)).toBe(false);
    expect(tocaRelampago({ ...dia, relampagoEn: 0 }, 10 * MINUTO, 8 * MINUTO)).toBe(false);
    expect(esDePaso("/")).toBe(true);
    expect(esDePaso("/practicar")).toBe(true);
    expect(esDePaso("/practicar/lista")).toBe(true);
    expect(esDePaso("/practicar/012-agrupar")).toBe(false);
    expect(esDePaso("/aprender/closures")).toBe(false);
    expect(esDePaso("/leccion")).toBe(false);
  });

  it("nota del día", () => {
    expect(notaDelDia({ hechas: 6, tocaban: 6, resueltos: 3, limpios: 3 }).nota).toBe("A");
    expect(notaDelDia({ hechas: 6, tocaban: 6, resueltos: 4, limpios: 1 }).nota).toBe("B");
    expect(notaDelDia({ hechas: 3, tocaban: 6, resueltos: 2, limpios: 2 }).nota).toBe("C");
    expect(notaDelDia({ hechas: 0, tocaban: 6 }).nota).toBe("F");
    expect(notaDelDia({ hechas: 6, tocaban: 6, resueltos: 3, limpios: 3, atraso: 3 }).puntos).toBe(85);
    expect(notaDelDia({ resueltos: 2, limpios: 2 }).nota).toBe("A");
    expect(guardarVeredicto([{ fecha: "a", nota: "F" }], { fecha: "a", nota: "B" })).toEqual([{ fecha: "a", nota: "B" }]);
  });

  it("franja de inglés", () => {
    expect(enFranjaIngles(20, { desde: 20, hasta: 22 })).toBe(true);
    expect(enFranjaIngles(22, { desde: 20, hasta: 22 })).toBe(false);
    expect(enFranjaIngles(1, { desde: 23, hasta: 2 })).toBe(true);
    expect(enFranjaIngles(20, null)).toBe(false);
  });

  it("elegir modelo: solo se sube", () => {
    expect(subirA("sonnet", "haiku")).toBe("sonnet");
    expect(subirA("opus", "sonnet")).toBe("opus");
    expect(subirA("haiku", "sonnet")).toBeNull();
    expect(subirA("haiku", "haiku")).toBeNull();
    expect(subirA(undefined, "haiku")).toBeNull();
    expect(subirA("gpt", "haiku")).toBeNull();
  });

  it("moverse: paradas dentro de la ventana, fuera del menú, y nunca la misma dos veces", () => {
    const lista = paradas(1900, 1000, 250);
    for (const p of lista) {
      expect(p.x).toBeGreaterThanOrEqual(250);
      expect(p.x + FIGURA.ancho).toBeLessThanOrEqual(1900);
      expect(p.y + FIGURA.alto).toBeLessThanOrEqual(1000);
    }
    for (const azar of [0, 0.3, 0.99]) expect(siguienteParada(lista, lista[0], azar)).not.toEqual(lista[0]);
    expect(encajar({ x: 5000, y: -40 }, 1900, 1000)).toEqual({ x: 1900 - FIGURA.ancho - FIGURA.margen, y: FIGURA.margen });
    expect(juntoA({ right: 1200, top: 300 }, 1900, 1000)).toEqual({ x: 1208, y: 290 });
    expect(juntoA({ right: 1890, top: 300 }, 1900, 1000).x).toBeLessThan(1890 - FIGURA.ancho);
    expect(masLejana(lista, lista[0])).not.toEqual(lista[0]);
  });

  it("recibimiento por pantalla según el plan de hoy", () => {
    const plan = { activo: true, dia: 3, dias: 15, estado: { tipo: "atrasado", dias: 1 }, hoy: { tareas: [{ tipo: "ejercicio", titulo: "Sumar pares", hecha: false }, { tipo: "ejercicio", titulo: "Otro", hecha: true }, { tipo: "ingles", titulo: "Inglés", hecha: false }] } };
    expect(recibimiento("/practicar", plan)).toBe('Hoy aquí: 1 ejercicio. Empieza por "Sumar pares".');
    expect(recibimiento("/aprender", plan)).toBe("Lo de hoy en esta parte ya está hecho.");
    expect(recibimiento("/ingles", plan)).toContain("20 minutos");
    expect(recibimiento("/progreso", plan)).toBe("Día 3 de 15. Vas atrasado 1 día.");
    expect(recibimiento("/practicar/012", plan)).toBeNull();
    expect(recibimiento("/practicar", { activo: false })).toBeNull();
  });
});
