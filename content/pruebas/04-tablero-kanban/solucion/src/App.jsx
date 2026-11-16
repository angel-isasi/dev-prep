// Tablero de Kallpa Studio: formulario y buscador arriba, tres columnas abajo.
import { useEffect, useRef, useState } from "react";
import { Column } from "./components/Column.jsx";
import { ConfirmDialog } from "./components/ConfirmDialog.jsx";
import { NewTaskForm } from "./components/NewTaskForm.jsx";
import { SearchBox } from "./components/SearchBox.jsx";
import { useBoard } from "./hooks/useBoard.js";
import { COLUMNS, columnTitle, matchesQuery } from "./lib/board.js";

export default function App() {
  const board = useBoard();
  const [query, setQuery] = useState("");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [movedTask, setMovedTask] = useState(null); // { id }: un objeto nuevo en cada movimiento

  const boardRef = useRef(null);
  const headingRefs = useRef({});
  const openerRef = useRef(null); // el botón Borrar que abrió el diálogo
  const returnFocusTo = useRef(null);

  const filtering = query.trim() !== "";

  // El foco se mueve DESPUÉS de que el diálogo se cerró y la página dejó de estar inerte
  useEffect(() => {
    if (taskToDelete || !returnFocusTo.current) return;
    returnFocusTo.current.focus();
    returnFocusTo.current = null;
  }, [taskToDelete]);

  // La tarjeta movida es un elemento nuevo en otra columna: la enfocamos cuando ya está en la página
  useEffect(() => {
    if (!movedTask) return;
    boardRef.current?.querySelector(`[data-task-id="${movedTask.id}"]`)?.focus();
  }, [movedTask]);

  function handleAdd(title) {
    const error = board.add(title);
    if (!error) setAnnouncement(`Tarea "${title.trim()}" creada en Por hacer.`);
    return error;
  }

  function handleMove(task, status) {
    board.move(task.id, status);
    setAnnouncement(`"${task.title}" se movió a ${columnTitle(status)}.`);
    setMovedTask({ id: task.id });
  }

  function handleRename(task, title) {
    const error = board.rename(task.id, title);
    if (!error && title.trim() !== task.title) setAnnouncement(`Tarea renombrada a "${title.trim()}".`);
    return error;
  }

  function askDelete(task, opener) {
    openerRef.current = opener;
    setTaskToDelete(task);
  }

  function cancelDelete() {
    returnFocusTo.current = openerRef.current;
    setTaskToDelete(null);
  }

  function confirmDelete() {
    board.remove(taskToDelete.id);
    setAnnouncement(`Tarea "${taskToDelete.title}" borrada.`);
    // El botón que abrió el diálogo ya no existe: el foco va al título de su columna
    returnFocusTo.current = headingRefs.current[taskToDelete.status];
    setTaskToDelete(null);
  }

  return (
    <div className="app">
      {/* inert: mientras el diálogo está abierto, lo de atrás no se puede enfocar ni pulsar */}
      <div className="app__page" inert={taskToDelete !== null}>
        <header className="app__header">
          <h1>Tablero de Kallpa Studio</h1>
          <p className="app__subtitle">Lo que hay que hacer, lo que está en curso y lo que ya salió.</p>
        </header>

        <main>
          <div className="toolbar">
            <NewTaskForm onAdd={handleAdd} />
            <SearchBox query={query} onQueryChange={setQuery} />
          </div>

          <div className="board" ref={boardRef}>
            {COLUMNS.map((column) => {
              // Estado derivado: las columnas y los contadores se calculan en cada render
              const all = board.tasks.filter((task) => task.status === column.id);
              const visible = all.filter((task) => matchesQuery(task, query));
              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={visible}
                  total={all.length}
                  filtering={filtering}
                  headingRef={(element) => {
                    headingRefs.current[column.id] = element;
                  }}
                  onMove={handleMove}
                  onRename={handleRename}
                  onDelete={askDelete}
                />
              );
            })}
          </div>
        </main>
      </div>

      {taskToDelete && (
        <ConfirmDialog
          title="¿Borrar la tarea?"
          message={`Vas a borrar "${taskToDelete.title}". Esta acción no se puede deshacer.`}
          confirmLabel="Borrar"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Siempre en la página: si apareciera recién con el mensaje, muchos lectores no lo leerían */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
