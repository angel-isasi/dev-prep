// Vistas de Entrevistas como funciones puras: arman las respuestas de /api/entrevistas a partir
// de las preguntas y tu progreso. Las usan las rutas del servidor y la versión celular.
import { preguntaPendiente } from "./progreso-reglas.js";

/**
 * Categorías con tu avance, total y cuántas tarjetas tocan hoy.
 * @param {{ categorias: object[], preguntas: object[], guias: object }} entrevistas
 * @param {object} registros  progreso de cada pregunta (datos.preguntas)
 * @param {string} hoy
 */
export function resumenEntrevistas(entrevistas, registros, hoy) {
  const de = (p) => registros[p.id];
  const categorias = entrevistas.categorias.map((c) => {
    const deCategoria = entrevistas.preguntas.filter((p) => p.categoria === c.nombre);
    return {
      ...c,
      vistas: deCategoria.filter((p) => de(p)).length,
      dominadas: deCategoria.filter((p) => (de(p)?.caja ?? 0) >= 3).length,
      pendientes: deCategoria.filter((p) => preguntaPendiente(de(p), hoy)).length,
    };
  });
  return {
    categorias,
    total: entrevistas.preguntas.length,
    pendientesHoy: entrevistas.preguntas.filter((p) => preguntaPendiente(de(p), hoy)).length,
    guias: entrevistas.guias,
    proceso: entrevistas.proceso ?? null,
  };
}

/**
 * Tarjetas de un mazo, con su progreso. Primero las que tocan repaso, luego las nunca vistas, luego el resto.
 * @param {{ preguntas: object[] }} entrevistas
 * @param {object} registros
 * @param {string} hoy
 * @param {{ categoria?: string, categorias?: string[], modo?: "repaso"|"nuevas" }} filtro
 */
export function tarjetas(entrevistas, registros, hoy, { categoria, categorias, modo } = {}) {
  let lista = entrevistas.preguntas;
  if (categoria) lista = lista.filter((p) => p.categoria === categoria);
  if (categorias?.length) lista = lista.filter((p) => categorias.includes(p.categoria));
  if (modo === "repaso") lista = lista.filter((p) => preguntaPendiente(registros[p.id], hoy));
  if (modo === "nuevas") lista = lista.filter((p) => !registros[p.id]);
  const prioridad = (p) => {
    const r = registros[p.id];
    return preguntaPendiente(r, hoy) ? 0 : !r ? 1 : 2;
  };
  return [...lista].sort((a, b) => prioridad(a) - prioridad(b)).map((p) => ({ ...p, progreso: registros[p.id] ?? null }));
}

/**
 * Ejercicios para practicar con tiempo (simulacro): retos y ejercicios de nivel 2 o más.
 * @param {object[]} ejercicios  índice de ejercicios
 * @param {object} registros  progreso de cada ejercicio (datos.ejercicios)
 */
export function ejerciciosEntrevista(ejercicios, registros) {
  return ejercicios
    .filter((ej) => ej.coleccion.endsWith("retos") || ej.nivel >= 2)
    .map((ej) => ({
      id: ej.id,
      titulo: ej.titulo,
      tema: ej.tema,
      nivel: ej.nivel,
      coleccion: ej.coleccion,
      estado: registros[ej.id]?.estado ?? "pendiente",
    }));
}
