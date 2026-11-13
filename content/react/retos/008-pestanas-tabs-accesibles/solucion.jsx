import { useId, useState } from "react";

export function Pestanas({ pestanas }) {
  const [activa, setActiva] = useState(0); // índice de la pestaña activa
  const id = useId();
  const total = pestanas.length;

  function alPresionarTecla(evento) {
    if (evento.key === "ArrowRight") setActiva((i) => (i + 1) % total);
    if (evento.key === "ArrowLeft") setActiva((i) => (i - 1 + total) % total);
  }

  return (
    <div>
      <div role="tablist">
        {pestanas.map((pestana, i) => (
          <button
            key={pestana.titulo}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={activa === i}
            aria-controls={`${id}-panel`}
            tabIndex={activa === i ? 0 : -1}
            onClick={() => setActiva(i)}
            onKeyDown={alPresionarTecla}
          >
            {pestana.titulo}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${activa}`}>
        {pestanas[activa].contenido}
      </div>
    </div>
  );
}
