// Una columna del tablero: título, contador y sus tarjetas.
import { TaskCard } from "./TaskCard.jsx";

/**
 * @param {{
 *   column: { id: string, title: string },
 *   tasks: Array<{ id: number, title: string, status: string }>,  las que se ven (ya filtradas)
 *   total: number,                                                cuántas tiene la columna sin filtro
 *   filtering: boolean,
 *   headingRef: (element: HTMLElement | null) => void,
 *   onMove: (task, status: string) => void,
 *   onRename: (task, title: string) => string,
 *   onDelete: (task, opener: HTMLElement) => void,
 * }} props
 */
export function Column(props) {
  // TODO: <section aria-labelledby="..."> con <h2 id="..." ref={headingRef} tabIndex={-1}>{column.title}</h2>
  //       y el contador con countLabel().
  // TODO: sin tareas: "Sin tareas" (o "Sin coincidencias" si hay filtro).
  // TODO: con tareas: <ul> con un <TaskCard /> por tarea.
  void props;
  void TaskCard;
  return null;
}
