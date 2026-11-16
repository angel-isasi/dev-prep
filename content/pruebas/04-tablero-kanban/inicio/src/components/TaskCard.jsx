// Una tarjeta: título y acciones, o el campo para editar el título.

/**
 * @param {{
 *   task: { id: number, title: string, status: string },
 *   onMove: (task, status: string) => void,
 *   onRename: (task, title: string) => string,   devuelve el error, o "" si se guardó
 *   onDelete: (task, opener: HTMLElement) => void,
 * }} props
 */
export function TaskCard(props) {
  // TODO (modo normal): <li data-task-id={task.id} tabIndex={-1}> con <h3>{task.title}</h3> y:
  //       un botón por cada getMoves(task.status) con aria-label="Mover <título> a <columna>",
  //       <button aria-label="Editar <título>">Editar</button>
  //       <button aria-label="Borrar <título>">Borrar</button>  -> onDelete(task, event.currentTarget)
  // TODO (modo edición, estado propio): <input aria-label="Editar título"> con el foco,
  //       Guardar (valida con onRename), Cancelar y Escape. Al terminar, el foco vuelve a Editar.
  void props;
  return null;
}
