// Vistas de Aprender como funciones puras: arman las respuestas de /api/aprender a partir
// del contenido y tu progreso. Las usan las rutas del servidor y la versión celular.
import { estadoVisible } from "./progreso-reglas.js";

/** Estado visible de un ejercicio ("pendiente" si nunca lo abriste). */
export function estadoDe(registros, id, hoy) {
  const r = registros[id];
  return r ? estadoVisible(r, hoy) : "pendiente";
}

/**
 * Resumen de un tema con tu avance.
 * @param {object} tema
 * @param {{ registros: object, quizzes: object, hoy: string }} progreso
 */
export function resumenTema(tema, { registros, quizzes }) {
  const quiz = quizzes[tema.id] ?? null;
  // Se cuenta lo que hiciste, no lo que se muestra: un resuelto con repaso pendiente sigue contando como resuelto.
  // "Con ayuda": pasaste los tests después de ver la solución (vuelve en el repaso para que cuente del todo).
  const estadoReal = (id) => registros[id]?.estado;
  return {
    id: tema.id,
    titulo: tema.titulo,
    area: tema.area,
    orden: tema.orden,
    descripcion: tema.descripcion,
    totalEjercicios: tema.ejercicios.length,
    resueltos: tema.ejercicios.filter((id) => estadoReal(id) === "resuelto").length,
    conAyuda: tema.ejercicios.filter((id) => estadoReal(id) === "repasar").length,
    quiz: quiz && { mejor: quiz.mejor, total: quiz.total },
    preguntasQuiz: tema.quiz.length,
  };
}

/**
 * Un tema completo: teoría, quiz, ejercicios y anterior/siguiente dentro de su área.
 * @param {{ temas: object[], porId: Map }} aprender
 * @param {string} id
 * @param {{ porId: Map }} indice  índice de ejercicios
 * @param {{ registros: object, quizzes: object, hoy: string }} progreso
 * @returns {object|null} null si el tema no existe
 */
export function detalleTema(aprender, id, indice, progreso) {
  const tema = aprender.porId.get(id);
  if (!tema) return null;
  const delArea = aprender.temas.filter((t) => t.area === tema.area);
  const orden = delArea.indexOf(tema);
  const vecino = (t) => (t ? { id: t.id, titulo: t.titulo } : null);
  return {
    ...resumenTema(tema, progreso),
    teoria: tema.teoria,
    quiz: tema.quiz,
    ejercicios: tema.ejercicios
      .map((ejId) => indice.porId.get(ejId))
      .filter(Boolean)
      .map((ej) => ({
        id: ej.id,
        titulo: ej.titulo,
        nivel: ej.nivel,
        tema: ej.tema,
        estado: estadoDe(progreso.registros, ej.id, progreso.hoy),
        resuelto: progreso.registros[ej.id]?.estado === "resuelto",
        conAyuda: progreso.registros[ej.id]?.estado === "repasar",
      })),
    anterior: vecino(delArea[orden - 1]),
    siguiente: vecino(delArea[orden + 1]),
  };
}
