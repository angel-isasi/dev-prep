// Simulacro de entrevista por etapas, como funciones puras (las usa la pantalla Simulacro).
//
// Un proceso real tiene etapas: recursos humanos, técnica, presentación de proyecto y cierre.
// armarProceso arma la lista de pasos de las etapas que elijas; planRefuerzo convierte lo que
// fallaste en una lista corta de qué estudiar después.

/** Cuántas preguntas toma cada etapa. */
export const CUPOS = { rrhh: 3, tecnica: 3, repreguntas: 2, proyecto: 3 };

/** Las etapas en el orden de un proceso real. */
export const ORDEN_ETAPAS = ["rrhh", "tecnica", "proyecto", "cierre"];

/** Mezcla una copia de la lista (Fisher-Yates) con la función de azar que le pases. */
export function mezclar(lista, azar = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Elige n preguntas: primero las que tocan repaso o nunca viste (las tarjetas ya vienen en ese
 * orden de prioridad), mezcladas entre sí para que cada simulacro sea distinto.
 */
function elegir(preguntas, n, azar) {
  const importantes = preguntas.filter((p) => !p.progreso || (p.progreso.caja ?? 0) < 3);
  const resto = preguntas.filter((p) => !importantes.includes(p));
  return [...mezclar(importantes, azar), ...mezclar(resto, azar)].slice(0, n);
}

/**
 * Pasos del simulacro para las etapas elegidas.
 * @param {{ tarjetas: object[], ejercicios: object[], proceso: object, etapas?: string[], azar?: () => number }} datos
 *   tarjetas: preguntas con `etapa` y `progreso` (vistas-entrevistas.js). ejercicios: los de ejerciciosEntrevista.
 * @returns {object[]} pasos: { etapa, tipo: "etapa"|"pregunta"|"ejercicio"|"repregunta"|"pitch"|"tus-preguntas", ... }
 */
export function armarProceso({ tarjetas, ejercicios, proceso, etapas = ORDEN_ETAPAS, azar = Math.random }) {
  const elegidas = ORDEN_ETAPAS.filter((e) => etapas.includes(e));
  const info = (id) =>
    proceso?.etapas?.find((e) => e.id === id) ?? {
      id,
      titulo: id,
      minutos: 0,
      descripcion: "",
    };
  const deEtapa = (etapa) => tarjetas.filter((t) => (t.etapa ?? "tecnica") === etapa);
  const pasos = [];

  for (const etapa of elegidas) {
    pasos.push({ etapa, tipo: "etapa", info: info(etapa) });
    if (etapa === "rrhh") {
      for (const p of elegir(deEtapa("rrhh"), CUPOS.rrhh, azar)) pasos.push({ etapa, tipo: "pregunta", p });
    }
    if (etapa === "tecnica") {
      const teoricas = elegir(deEtapa("tecnica"), CUPOS.tecnica, azar);
      const sinResolver = ejercicios.filter((e) => e.estado !== "resuelto");
      const [ejercicio] = mezclar(sinResolver.length ? sinResolver : ejercicios, azar);
      // Como en una entrevista: un par de preguntas, el ejercicio, sus repreguntas y una pregunta final.
      for (const p of teoricas.slice(0, 2)) pasos.push({ etapa, tipo: "pregunta", p });
      if (ejercicio) {
        pasos.push({ etapa, tipo: "ejercicio", ej: ejercicio });
        for (const p of mezclar(proceso?.repreguntas ?? [], azar).slice(0, CUPOS.repreguntas)) pasos.push({ etapa, tipo: "repregunta", p });
      }
      for (const p of teoricas.slice(2)) pasos.push({ etapa, tipo: "pregunta", p });
    }
    if (etapa === "proyecto") {
      pasos.push({ etapa, tipo: "pitch" });
      for (const p of elegir(deEtapa("proyecto"), CUPOS.proyecto, azar)) pasos.push({ etapa, tipo: "pregunta", p });
    }
    if (etapa === "cierre") {
      pasos.push({
        etapa,
        tipo: "tus-preguntas",
        sugeridas: proceso?.preguntasParaElEntrevistador ?? [],
      });
    }
  }
  return pasos;
}

/** Minutos totales de las etapas elegidas. */
export function minutosProceso(proceso, etapas = ORDEN_ETAPAS) {
  return (proceso?.etapas ?? []).filter((e) => etapas.includes(e.id)).reduce((t, e) => t + (e.minutos ?? 0), 0);
}

const MAL = ["no", "dude", "no-llegue"];

/**
 * Plan de refuerzo: qué estudiar después según lo que fallaste.
 * @param {object[]} pasos  los de armarProceso
 * @param {(string|null)[]} resultados  uno por paso: "sabia" | "dude" | "no" | "hecho" | "no-llegue" | null
 * @param {{ comunicacion?: string[], comunicacionTotal?: {id: string, texto: string, consejo?: string}[], tusPreguntas?: number }} extra
 * @returns {{ tipo: string, texto: string, categoria?: string, id?: string }[]} de lo más urgente a lo menos
 */
export function planRefuerzo(pasos, resultados, { comunicacion = [], comunicacionTotal = [], tusPreguntas = 0 } = {}) {
  const plan = [];
  // Categorías con preguntas que no sabías o dudaste, de la más fallada a la menos
  const fallas = new Map();
  pasos.forEach((paso, i) => {
    if (paso.tipo === "pregunta" && MAL.includes(resultados[i])) {
      const c = paso.p.categoria;
      fallas.set(c, (fallas.get(c) ?? 0) + (resultados[i] === "no" ? 2 : 1));
    }
  });
  for (const [categoria] of [...fallas].sort((a, b) => b[1] - a[1])) {
    plan.push({
      tipo: "mazo",
      categoria,
      texto: `Repasa las tarjetas de ${categoria}.`,
    });
  }

  const ejercicio = pasos.findIndex((p) => p.tipo === "ejercicio");
  if (ejercicio >= 0 && resultados[ejercicio] === "no-llegue") {
    plan.push({
      tipo: "ejercicio",
      id: pasos[ejercicio].ej.id,
      texto: `Termina el ejercicio "${pasos[ejercicio].ej.titulo}" sin mirar la solución.`,
    });
  }

  const repreguntasMal = pasos.filter((p, i) => p.tipo === "repregunta" && MAL.includes(resultados[i]));
  if (repreguntasMal.length) {
    plan.push({
      tipo: "repreguntas",
      texto: `Antes de dar por terminado un ejercicio, pregúntate tú mismo: ${repreguntasMal.map((p) => `"${p.p.pregunta}"`).join(" y ")}`,
    });
  }

  const pitch = pasos.findIndex((p) => p.tipo === "pitch");
  if (pitch >= 0 && MAL.includes(resultados[pitch])) {
    plan.push({
      tipo: "pitch",
      texto: "Practica tu pitch de 1 minuto en voz alta, grabándote, hasta que salga sin leer.",
    });
  }

  const faltantes = comunicacionTotal.filter((c) => !comunicacion.includes(c.id));
  if (faltantes.length) {
    plan.push({
      tipo: "voz-alta",
      texto: `En el próximo simulacro, enfócate en esto: ${faltantes.map((c) => c.consejo ?? c.texto.toLowerCase()).join("; ")}.`,
    });
  }

  if (pasos.some((p) => p.tipo === "tus-preguntas") && tusPreguntas < 2) {
    plan.push({
      tipo: "tus-preguntas",
      texto: "Llega siempre con 2 o 3 preguntas para el entrevistador. Elige las tuyas en la etapa de cierre.",
    });
  }

  return plan;
}
