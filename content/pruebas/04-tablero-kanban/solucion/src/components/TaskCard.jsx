// Una tarjeta: título y acciones, o el campo para editar el título.
// El modo edición es estado propio de la tarjeta: a nadie más le importa.
import { useEffect, useId, useRef, useState } from "react";
import { getMoves } from "../lib/board.js";

/**
 * @param {{
 *   task: { id: number, title: string, status: string },
 *   onMove: (task, status: string) => void,
 *   onRename: (task, title: string) => string,   devuelve el error, o "" si se guardó
 *   onDelete: (task, opener: HTMLElement) => void,
 * }} props
 */
export function TaskCard({ task, onMove, onRename, onDelete }) {
  const errorId = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const editButtonRef = useRef(null);
  // Solo devolvemos el foco al botón Editar cuando termina una edición, no al montar la tarjeta
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
    setError("");
    setEditing(true);
  }

  function stopEditing() {
    returnFocus.current = true;
    setEditing(false);
  }

  function handleSave(event) {
    event.preventDefault();
    const message = onRename(task, draft);
    if (message) {
      setError(message);
      inputRef.current?.focus();
      return;
    }
    stopEditing();
  }

  if (editing) {
    return (
      <li className="card card--editing">
        <form className="card__edit" onSubmit={handleSave} noValidate>
          <input
            ref={inputRef}
            type="text"
            aria-label="Editar título"
            value={draft}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") stopEditing();
            }}
          />
          <div className="card__actions">
            <button type="submit">Guardar</button>
            <button type="button" className="btn-secondary" onClick={stopEditing}>
              Cancelar
            </button>
          </div>
          {error && (
            <p id={errorId} role="alert" className="form-error">
              {error}
            </p>
          )}
        </form>
      </li>
    );
  }

  return (
    // data-task-id y tabIndex -1: App enfoca la tarjeta después de moverla
    <li className="card" data-task-id={task.id} tabIndex={-1}>
      <h3 className="card__title">{task.title}</h3>
      <div className="card__actions">
        {/* Los botones dicen qué tarea mueven: "→ Hecho" solo no le dice nada a un lector de pantalla */}
        {getMoves(task.status).map((move) => (
          <button
            key={move.id}
            type="button"
            className="btn-secondary"
            aria-label={`Mover ${task.title} a ${move.title}`}
            onClick={() => onMove(task, move.id)}
          >
            {move.direction === "back" ? `← ${move.title}` : `${move.title} →`}
          </button>
        ))}
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
          className="btn-ghost btn-ghost--danger"
          aria-label={`Borrar ${task.title}`}
          onClick={(event) => onDelete(task, event.currentTarget)}
        >
          Borrar
        </button>
      </div>
    </li>
  );
}
