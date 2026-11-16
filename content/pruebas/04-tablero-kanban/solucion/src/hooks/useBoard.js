// Hook del tablero: el estado con useReducer y acciones listas para usar.
import { useReducer } from "react";
import { INITIAL_TASKS } from "../data.js";
import { boardReducer, validateTitle } from "../lib/board.js";

export function useBoard(initialTasks = INITIAL_TASKS) {
  const [tasks, dispatch] = useReducer(boardReducer, initialTasks);

  /** Devuelve el mensaje de error, o "" si la tarea se creó. */
  function add(title) {
    const error = validateTitle(title, tasks);
    if (!error) dispatch({ type: "added", title });
    return error;
  }

  /** Devuelve el mensaje de error, o "" si el título se cambió. */
  function rename(id, title) {
    const error = validateTitle(title, tasks, id);
    if (!error) dispatch({ type: "renamed", id, title });
    return error;
  }

  return {
    tasks,
    add,
    rename,
    move: (id, status) => dispatch({ type: "moved", id, status }),
    remove: (id) => dispatch({ type: "deleted", id }),
  };
}
