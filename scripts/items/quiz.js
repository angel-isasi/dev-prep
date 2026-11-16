// Ítems "opcion/quiz": las preguntas de quiz.json de cada tema, tal cual.
import { hayRepetidas } from "./util.js";

/**
 * @param {{ id: string, titulo: string, quiz: object[] }[]} temas
 * @returns {object[]} ítems
 */
export function generarQuiz(temas) {
  const items = [];
  for (const tema of temas) {
    (tema.quiz ?? []).forEach((q, n) => {
      const valida =
        typeof q.pregunta === "string" &&
        Array.isArray(q.opciones) &&
        q.opciones.length >= 2 &&
        Number.isInteger(q.correcta) &&
        q.correcta >= 0 &&
        q.correcta < q.opciones.length &&
        typeof q.explicacion === "string" &&
        !hayRepetidas(q.opciones);
      if (!valida) return;
      items.push({
        clave: `quiz:${tema.id}:${n}`,
        tipo: "opcion",
        subtipo: "quiz",
        unidad: tema.id,
        fuente: { tipo: "tema", id: tema.id, titulo: tema.titulo },
        pregunta: q.pregunta,
        opciones: q.opciones,
        correcta: q.correcta,
        explicacion: q.explicacion,
      });
    });
  }
  return items;
}
