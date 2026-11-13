import { useId, useState } from "react";

export function Comentario({ max = 140 }) {
  const [texto, setTexto] = useState("");
  const id = useId();

  // Estado derivado: se calcula en cada render, no se guarda.
  const restantes = max - texto.length;
  const vacio = texto.trim() === "";

  return (
    <div>
      <label htmlFor={id}>Comentario</label>
      <textarea
        id={id}
        value={texto}
        maxLength={max}
        onChange={(evento) => setTexto(evento.target.value)}
      />
      <p aria-live="polite" style={{ color: restantes < 10 ? "crimson" : "inherit" }}>
        {restantes} caracteres restantes
      </p>
      <button type="button" disabled={vacio}>
        Publicar
      </button>
    </div>
  );
}
