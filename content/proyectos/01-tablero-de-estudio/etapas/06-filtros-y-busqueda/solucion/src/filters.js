// Filtros del tablero: funciones puras, sin React, fáciles de probar.

export const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "done", label: "Hechas" },
];

/** "  Guía " -> "guia": sin tildes, en minúsculas y sin espacios en los extremos. */
export function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Tareas que cumplen el filtro de estado y contienen la búsqueda en el título o el tema. */
export function filterTasks(tasks, filter = "all", query = "") {
  const search = normalize(query);
  return tasks.filter((task) => {
    if (filter === "pending" && task.done) return false;
    if (filter === "done" && !task.done) return false;
    if (search === "") return true;
    return normalize(task.title).includes(search) || normalize(task.topic).includes(search);
  });
}
