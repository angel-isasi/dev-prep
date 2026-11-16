import { useEffect, useRef, useState } from "react";

// Una tarea. El modo edición es estado propio (a nadie más le importa);
// los cambios reales se avisan hacia arriba con onToggle, onEdit y onDelete.
export function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);
  const editButtonRef = useRef(null);
  // ¿Hay que devolver el foco al botón Editar? Solo cuando la edición termina, no al montar
  const returnFocus = useRef(false);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [editing]);

  function startEditing() {
    setDraft(task.title);
    setEditing(true);
  }

  function stopEditing() {
    returnFocus.current = true;
    setEditing(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    const clean = draft.trim();
    if (clean === "") return;
    if (clean === task.title) {
      stopEditing();
      return;
    }
    const ok = await onEdit?.(task.id, clean);
    if (ok !== false) stopEditing();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") stopEditing();
  }

  if (editing) {
    return (
      <li className="task task--editing">
        <form className="task__edit" onSubmit={handleSave} noValidate>
          <input
            ref={inputRef}
            type="text"
            aria-label="Editar título"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="submit">Guardar</button>
          <button type="button" className="btn-ghost" onClick={stopEditing}>
            Cancelar
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className={task.done ? "task task--done" : "task"}>
      <label className="task__main">
        <input type="checkbox" checked={task.done} onChange={() => onToggle?.(task.id)} />
        <span className="task__title">{task.title}</span>
      </label>
      <span className="task__topic">{task.topic}</span>
      <div className="task__actions">
        {/* "Editar" a secas no dice cuál: el aria-label incluye el título de la tarea */}
        <button
          ref={editButtonRef}
          type="button"
          className="btn-ghost"
          aria-label={`Editar ${task.title}`}
          onClick={startEditing}
        >
          Editar
        </button>
        <button
          type="button"
          className="btn-ghost btn-danger"
          aria-label={`Borrar ${task.title}`}
          onClick={() => onDelete?.(task.id)}
        >
          Borrar
        </button>
      </div>
    </li>
  );
}
