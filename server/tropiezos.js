// Tropiezos: lo que te cuesta en toda la app, en texto corto para la IA (Jarvis y el resto de tutores).
// Lógica pura: recibe los datos ya cargados y devuelve líneas. No gasta IA.

const primeraLinea = (texto, max = 90) => {
  const linea = String(texto ?? "").split("\n").find((l) => l.trim() && !l.startsWith("```")) ?? "";
  return linea.length > max ? linea.slice(0, max - 1) + "…" : linea;
};

/**
 * @param {object} p
 * @param {Array} p.items              ítems de lecciones { clave, unidad, pregunta }
 * @param {object} p.registrosItems    clave -> { ultima, vistas }
 * @param {object} p.titulo            id de unidad -> título
 * @param {Array} p.preguntas          preguntas de entrevista { id, pregunta }
 * @param {object} p.registrosPreguntas id -> { ultima }
 * @param {object} p.quizzes           id -> { ultimo, total }
 * @param {string[]} p.vistas          títulos de ejercicios donde vio la solución sin resolverlos
 * @returns {string[]} líneas (vacío si no hay tropiezos)
 */
export function tropiezosDe({ items = [], registrosItems = {}, titulo = {}, preguntas = [], registrosPreguntas = {}, quizzes = {}, vistas = [] } = {}) {
  const lineas = [];

  // Lecciones: preguntas que falló la última vez, agrupadas por tema
  const falladas = items.filter((it) => registrosItems[it.clave]?.ultima === "no");
  if (falladas.length) {
    const porTema = {};
    for (const it of falladas) porTema[it.unidad] = (porTema[it.unidad] ?? 0) + 1;
    const temas = Object.entries(porTema)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([u, n]) => `${titulo[u] ?? u} (${n})`);
    lineas.push(`Preguntas de lecciones que falló la última vez: ${falladas.length}, sobre todo en ${temas.join(", ")}.`);
    const ejemplos = falladas.slice(-3).map((it) => `"${primeraLinea(it.pregunta)}"`);
    lineas.push(`Ejemplos de lo que falló: ${ejemplos.join("; ")}.`);
  }

  // Quizzes con menos del 60 %
  const flojos = Object.entries(quizzes)
    .filter(([, q]) => q?.total && q.ultimo / q.total < 0.6)
    .map(([id, q]) => `${titulo[id.replace(/^prueba:/, "")] ?? id} ${q.ultimo}/${q.total}`);
  if (flojos.length) lineas.push(`Quizzes y pruebas con nota baja: ${flojos.slice(0, 4).join(", ")}.`);

  // Preguntas de entrevista que marcó "no sabía"
  const noSabe = preguntas.filter((p) => registrosPreguntas[p.id]?.ultima === "no");
  if (noSabe.length) lineas.push(`Preguntas de entrevista que no supo (${noSabe.length}): ${noSabe.slice(-3).map((p) => `"${primeraLinea(p.pregunta, 70)}"`).join("; ")}.`);

  // Ejercicios donde miró la solución
  if (vistas.length) lineas.push(`Ejercicios donde vio la solución sin resolverlos (${vistas.length}): ${vistas.slice(-4).join(", ")}.`);

  return lineas;
}
