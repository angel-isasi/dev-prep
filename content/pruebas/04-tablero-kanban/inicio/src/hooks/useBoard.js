// Hook del tablero: el estado con useReducer y acciones listas para usar.
import { INITIAL_TASKS } from "../data.js";

export function useBoard(initialTasks = INITIAL_TASKS) {
  // TODO: const [tasks, dispatch] = useReducer(boardReducer, initialTasks);
  // TODO: add(title) y rename(id, title) validan con validateTitle(): si hay error lo devuelven (string),
  //       si no, despachan la acción y devuelven "".
  return {
    tasks: initialTasks,
    add: () => "",
    rename: () => "",
    move: () => {},
    remove: () => {},
  };
}
