// Estado del tablero (reducer) y reglas. Funciones puras: sin React, fáciles de probar.
//
// Estado: un arreglo de tareas [{ id: number, title: string, status: "todo" | "doing" | "done" }].
// El orden del arreglo es el orden dentro de cada columna.

export const COLUMNS = [
  { id: "todo", title: "Por hacer" },
  { id: "doing", title: "En curso" },
  { id: "done", title: "Hecho" },
];

export const MAX_TITLE_LENGTH = 80;

/** "  Menú " -> "menu": sin tildes, en minúsculas y sin espacios en los extremos. (Ya está hecho.) */
export function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export const columnTitle = (status) => COLUMNS.find((column) => column.id === status)?.title ?? status;

/**
 * Columnas a las que se puede mover una tarea desde la suya: solo las vecinas.
 * getMoves("doing") -> [{ id: "todo", title: "Por hacer", direction: "back" }, { id: "done", title: "Hecho", direction: "forward" }]
 */
export function getMoves(status) {
  // TODO
  void status;
  return [];
}

/**
 * Devuelve el mensaje de error del título, o "" si es válido (los textos exactos están en el enunciado).
 * ignoreId: al editar, la tarea puede quedarse con su propio título.
 */
export function validateTitle(title, tasks, ignoreId = null) {
  // TODO: vacío, más de MAX_TITLE_LENGTH y repetido (compara con normalize()).
  void title;
  void tasks;
  void ignoreId;
  return "";
}

/**
 * Acciones sugeridas:
 *   { type: "added", title }       al final de "todo" (id nuevo: el mayor + 1)
 *   { type: "moved", id, status }  al final de la columna de destino
 *   { type: "renamed", id, title }
 *   { type: "deleted", id }
 * Devuelve SIEMPRE un arreglo nuevo: no modifiques el anterior.
 */
export function boardReducer(tasks, action) {
  // TODO
  void action;
  return tasks;
}

/** ¿La tarea contiene la búsqueda? Con la búsqueda vacía, todas cumplen. */
export function matchesQuery(task, query) {
  // TODO
  void task;
  void query;
  return true;
}

/** "3 tareas", "1 tarea" o, con un filtro activo, "1 de 3 tareas". */
export function countLabel(visible, total, filtering) {
  // TODO
  void visible;
  void total;
  void filtering;
  return "";
}
