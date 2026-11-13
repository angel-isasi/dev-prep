import { useState } from "react";

export function Favorito() {
  const [activo, setActivo] = useState(false);

  return (
    <button aria-pressed={activo} onClick={() => setActivo((anterior) => !anterior)}>
      {activo ? "Quitar de favoritos" : "Agregar a favoritos"}
    </button>
  );
}
