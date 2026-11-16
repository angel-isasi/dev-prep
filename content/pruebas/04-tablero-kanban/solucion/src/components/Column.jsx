// Una columna del tablero: título, contador y sus tarjetas.
import { countLabel } from "../lib/board.js";
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
export function Column({ column, tasks, total, filtering, headingRef, onMove, onRename, onDelete }) {
  const headingId = `column-${column.id}`;

  return (
    <section className={`column column--${column.id}`} aria-labelledby={headingId}>
      <header className="column__header">
        {/* tabIndex -1: no está en el orden de Tab, pero se puede enfocar por código (después de borrar) */}
        <h2 id={headingId} ref={headingRef} tabIndex={-1}>
          {column.title}
        </h2>
        <p className="column__count">{countLabel(tasks.length, total, filtering)}</p>
      </header>

      {tasks.length === 0 ? (
        <p className="column__empty">{filtering ? "Sin coincidencias" : "Sin tareas"}</p>
      ) : (
        <ul className="column__list" aria-labelledby={headingId}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onMove={onMove} onRename={onRename} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
