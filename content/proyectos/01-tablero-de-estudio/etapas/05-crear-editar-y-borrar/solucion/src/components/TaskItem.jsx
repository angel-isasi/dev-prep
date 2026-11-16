import { useState } from "react";

// Una tarea. El modo edición es estado propio (a nadie más le importa);
// los cambios reales se avisan hacia arriba con onToggle, onEdit y onDelete.
export function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  function startEditing() {
    setDraft(task.title);
    setEditing(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    const clean = draft.trim();
    if (clean === "") return;
    if (clean === task.title) {
      setEditing(false);
      return;
    }
    const ok = await onEdit?.(task.id, clean);
    if (ok !== false) setEditing(false);
  }

  if (editing) {
    return (
      <li className="task task--editing">
        <form className="task__edit" onSubmit={handleSave} noValidate>
          <input type="text" aria-label="Editar título" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button type="submit">Guardar</button>
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
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
        <button type="button" className="btn-ghost" aria-label={`Editar ${task.title}`} onClick={startEditing}>
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
