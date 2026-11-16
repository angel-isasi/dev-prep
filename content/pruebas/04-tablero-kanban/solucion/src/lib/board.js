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

/** "  Menú " -> "menu": sin tildes, en minúsculas y sin espacios en los extremos. */
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
 * @returns {Array<{ id: string, title: string, direction: "back" | "forward" }>}
 */
export function getMoves(status) {
  const index = COLUMNS.findIndex((column) => column.id === status);
  const moves = [];
  if (index > 0) moves.push({ ...COLUMNS[index - 1], direction: "back" });
  if (index >= 0 && index < COLUMNS.length - 1) moves.push({ ...COLUMNS[index + 1], direction: "forward" });
  return moves;
}

/**
 * Devuelve el mensaje de error del título, o "" si es válido.
 * ignoreId: al editar, la tarea puede quedarse con su propio título.
 */
export function validateTitle(title, tasks, ignoreId = null) {
  const clean = title.trim();
  if (clean === "") return "Escribe un título para la tarea.";
  if (clean.length > MAX_TITLE_LENGTH) return `El título no puede pasar de ${MAX_TITLE_LENGTH} caracteres.`;
  const taken = tasks.some((task) => task.id !== ignoreId && normalize(task.title) === normalize(clean));
  if (taken) return "Ya existe una tarea con ese título.";
  return "";
}

/**
 * Acciones:
 *   { type: "added", title }       al final de "todo"
 *   { type: "moved", id, status }  al final de la columna de destino
 *   { type: "renamed", id, title }
 *   { type: "deleted", id }
 * Siempre devuelve un arreglo nuevo: nunca modifica el anterior.
 */
export function boardReducer(tasks, action) {
  switch (action.type) {
    case "added": {
      const id = Math.max(0, ...tasks.map((task) => task.id)) + 1;
      return [...tasks, { id, title: action.title.trim(), status: "todo" }];
    }
    case "moved": {
      const task = tasks.find((t) => t.id === action.id);
      if (!task || task.status === action.status) return tasks;
      // Se saca de donde estaba y se pone al final: así queda última en su nueva columna
      return [...tasks.filter((t) => t.id !== action.id), { ...task, status: action.status }];
    }
    case "renamed":
      return tasks.map((task) => (task.id === action.id ? { ...task, title: action.title.trim() } : task));
    case "deleted":
      return tasks.filter((task) => task.id !== action.id);
    default:
      // Un error de tipeo en el nombre de la acción se ve enseguida, en vez de "no pasa nada"
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

/** ¿La tarea contiene la búsqueda? Con la búsqueda vacía, todas cumplen. */
export function matchesQuery(task, query) {
  const search = normalize(query);
  return search === "" || normalize(task.title).includes(search);
}

/** "3 tareas", "1 tarea" o, con un filtro activo, "1 de 3 tareas". */
export function countLabel(visible, total, filtering) {
  const noun = total === 1 ? "tarea" : "tareas";
  return filtering ? `${visible} de ${total} ${noun}` : `${total} ${noun}`;
}
