// Formulario para crear una tarea: valida, muestra el error junto al campo y deja el foco listo.
import { useId, useRef, useState } from "react";

/** @param {{ onAdd: (title: string) => string }} props  onAdd devuelve el error, o "" si se creó. */
export function NewTaskForm({ onAdd }) {
  const id = useId();
  const errorId = `${id}-error`;
  const inputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const message = onAdd(title);
    setError(message);
    if (!message) setTitle("");
    // Con error o sin él, el foco queda en el campo: para corregir o para escribir la siguiente
    inputRef.current?.focus();
  }

  return (
    <form className="new-task" onSubmit={handleSubmit} noValidate>
      <label htmlFor={id}>Nueva tarea</label>
      <div className="new-task__row">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={title}
          autoComplete="off"
          placeholder="Ej.: Maquetar el pie de página"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
        />
        <button type="submit">Agregar</button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="form-error">
          {error}
        </p>
      )}
    </form>
  );
}
