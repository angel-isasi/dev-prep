// Examen de nivel de inglés adaptativo (de A1 a C2). Funciones puras: se prueban en examen.test.js.
//
// Idea: tu nivel es "cuántas unidades del camino dominas" (k, de 0 a n). Al empezar, todo k es igual de
// probable. Cada respuesta actualiza esas probabilidades (regla de Bayes):
// - si dominas la unidad de la pregunta, aciertas casi siempre (fallas por despiste un 10%);
// - si no la dominas, solo aciertas por suerte (1 entre el número de opciones).
// La siguiente pregunta sale de la unidad que mejor parte en dos lo que todavía no sabemos (la mediana).
// Así un acierto de suerte no te sube de golpe: hacen falta varias respuestas que coincidan.
// "No lo sé" cuenta como no dominarla, sin el ruido de adivinar.

export const EXAMEN = { minimo: 20, maximo: 34, confianza: 0.9, despiste: 0.15, maxPorUnidad: 3 };

const quitarMarcas = (t) => String(t ?? "").replace(/\*\*/g, "");

/**
 * Banco de preguntas por unidad (en el orden del camino): gramática, "¿cuál suena natural?" y significado de palabras.
 * @param {object[]} items  ítems de inglés ya expandidos (los de api.lecciones("ingles"))
 * @param {{ id: string }[]} unidades  en orden
 * @returns {object[][]} banco[i] = preguntas de la unidad i
 */
export function bancoExamen(items, unidades) {
  const pos = new Map(unidades.map((u, i) => [u.id, i]));
  const banco = unidades.map(() => []);
  for (const it of items) {
    const i = pos.get(it.unidad);
    if (i === undefined) continue;
    if (it.tipo === "opcion" && (it.subtipo === "gramatica" || it.subtipo === "natural") && it.opciones?.length >= 2) {
      banco[i].push({ clave: it.clave, unidad: it.unidad, tipo: it.subtipo, pregunta: it.pregunta, opciones: it.opciones.map(quitarMarcas), correcta: it.correcta, explicacion: it.explicacion });
    } else if (it.concepto === "palabra") {
      // la variante "¿Qué significa...?" de la palabra (sus opciones ya vienen sin dos significados iguales)
      const sig = (it.variantes ?? []).find((v) => v.forma === "palabra" && v.opciones?.length >= 3);
      if (sig) banco[i].push({ clave: it.clave, unidad: it.unidad, tipo: "palabra", pregunta: `¿Qué significa **${it.en}**?`, opciones: sig.opciones.map(quitarMarcas), correcta: sig.correcta, explicacion: `**${it.en}**: ${it.es}` });
    }
  }
  return banco;
}

/** Examen nuevo para un camino de n unidades: todas las posiciones igual de probables. */
export function crearExamen(n) {
  return { n, prob: Array.from({ length: n + 1 }, () => 1 / (n + 1)), respuestas: [], usadas: [], porUnidad: {} };
}

/** k más probable "por la mitad": el menor k con al menos la mitad de la probabilidad acumulada. */
export function mediana(prob) {
  let acumulada = 0;
  for (let k = 0; k < prob.length; k++) {
    acumulada += prob[k];
    if (acumulada >= 0.5) return k;
  }
  return prob.length - 1;
}

/** Probabilidad de que tu nivel esté a una unidad o menos de la mediana. */
export function certeza(prob) {
  const m = mediana(prob);
  return prob.slice(Math.max(0, m - 1), m + 2).reduce((a, b) => a + b, 0);
}

/**
 * La siguiente pregunta: de la unidad que deja la probabilidad más cerca de 50/50, sin repetir preguntas
 * ni pasar de 3 por unidad, y alternando tipos.
 * @returns {{ indice: number, pregunta: object } | null}
 */
export function siguientePregunta(examen, banco, azar = Math.random) {
  const { n, prob, usadas, porUnidad } = examen;
  // P(dominas la unidad j) = P(k > j)
  const mayor = [];
  let cola = 0;
  for (let j = n - 1; j >= 0; j--) {
    cola += prob[j + 1];
    mayor[j] = cola;
  }
  const candidatas = Array.from({ length: n }, (_, j) => j)
    .filter((j) => banco[j]?.some((p) => !usadas.includes(p.clave)) && (porUnidad[j] ?? 0) < EXAMEN.maxPorUnidad)
    .sort((a, b) => Math.abs(mayor[a] - 0.5) - Math.abs(mayor[b] - 0.5) || a - b);
  const j = candidatas[0];
  if (j === undefined) return null;
  const libres = banco[j].filter((p) => !usadas.includes(p.clave));
  const tipoAnterior = examen.respuestas.at(-1)?.tipo;
  const otras = libres.filter((p) => p.tipo !== tipoAnterior);
  const lista = otras.length ? otras : libres;
  return { indice: j, pregunta: lista[Math.floor(azar() * lista.length)] };
}

/**
 * Registra una respuesta y actualiza las probabilidades.
 * @param {"bien"|"mal"|"nose"} resultado
 */
export function responderExamen(examen, indice, pregunta, resultado) {
  // acertar sin dominarla: 1 entre las opciones, más un poco porque a veces descartas alguna
  const suerte = Math.min(0.75, 1 / Math.max(2, pregunta.opciones.length) + 0.1);
  const { despiste } = EXAMEN;
  const prob = examen.prob.map((p, k) => {
    const domina = k > indice;
    const verosimil = resultado === "bien" ? (domina ? 1 - despiste : suerte) : resultado === "mal" ? (domina ? despiste : 1 - suerte) : domina ? despiste : 1;
    return p * verosimil;
  });
  const total = prob.reduce((a, b) => a + b, 0) || 1;
  return {
    ...examen,
    prob: prob.map((p) => p / total),
    respuestas: [...examen.respuestas, { indice, clave: pregunta.clave, unidad: pregunta.unidad, tipo: pregunta.tipo, resultado }],
    usadas: [...examen.usadas, pregunta.clave],
    porUnidad: { ...examen.porUnidad, [indice]: (examen.porUnidad[indice] ?? 0) + 1 },
  };
}

/** ¿Ya hay suficiente? Mínimo 18 preguntas; termina antes de 34 si el nivel quedó claro. */
export function examenTerminado(examen, banco) {
  const hechas = examen.respuestas.length;
  if (hechas >= EXAMEN.maximo) return true;
  if (hechas >= EXAMEN.minimo && certeza(examen.prob) >= EXAMEN.confianza) return true;
  return !siguientePregunta(examen, banco, () => 0);
}

/**
 * Resultado: cuántas unidades dominas, dónde empiezas y tu nivel (A1 a C2).
 * @returns {{ dominadas: number, hasta: string, todas: boolean, nivel: string, porNivel: Record<string, { bien: number, total: number }>, aciertos: number, total: number }}
 */
export function resultadoExamen(examen, unidades) {
  const dominadas = mediana(examen.prob);
  const todas = dominadas >= unidades.length;
  const hasta = unidades[Math.min(dominadas, unidades.length - 1)]?.id ?? null;
  const nivel = dominadas === 0 ? "Principiante" : unidades[dominadas - 1].nivel;
  const porNivel = {};
  for (const r of examen.respuestas) {
    const nv = unidades[r.indice]?.nivel ?? "?";
    porNivel[nv] ??= { bien: 0, total: 0 };
    porNivel[nv].total++;
    if (r.resultado === "bien") porNivel[nv].bien++;
  }
  const aciertos = examen.respuestas.filter((r) => r.resultado === "bien").length;
  return { dominadas, hasta, todas, nivel, porNivel, aciertos, total: examen.respuestas.length };
}

/** ¿La unidad cuenta como hecha por el examen? (las anteriores a donde llegaste; todas si las dominaste todas) */
export function hechaPorExamen(examen, ordenIds, id) {
  if (!examen?.hasta) return false;
  const tope = ordenIds.indexOf(examen.hasta);
  const i = ordenIds.indexOf(id);
  if (tope < 0 || i < 0) return false;
  return i < tope || (examen.todas && i === tope);
}
