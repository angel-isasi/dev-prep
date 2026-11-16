import { useId, useState } from "react";
import { TOPICS } from "../data.js";

const MIN_LENGTH = 3;
const MAX_LENGTH = 80;

/** Devuelve el mensaje de error del título, o "" si es válido. */
export function validateTitle(title) {
  const clean = title.trim();
  if (clean === "") return "Escribe un título para la tarea";
  if (clean.length < MIN_LENGTH) return `El título debe tener al menos ${MIN_LENGTH} caracteres`;
  if (clean.length > MAX_LENGTH) return `El título no puede pasar de ${MAX_LENGTH} caracteres`;
  return "";
}

export function TaskForm({ onAdd, topics = TOPICS }) {
  const id = useId(); // ids únicos aunque haya dos formularios en la página
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const message = validateTitle(title);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    const ok = await onAdd({ title: title.trim(), topic });
    // Si quien nos usa avisa que falló (false), dejamos el texto para reintentar
    if (ok !== false) setTitle("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={`${id}-title`}>Tarea</label>
        <input
          id={`${id}-title`}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej.: Repasar map, filter y reduce"
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-topic`}>Tema</label>
        <select id={`${id}-topic`} value={topic} onChange={(event) => setTopic(event.target.value)}>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Agregar</button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </form>
  );
}
