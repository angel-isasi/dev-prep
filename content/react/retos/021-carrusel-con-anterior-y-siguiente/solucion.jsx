import { useState } from "react";

export function Carrusel({ slides }) {
  const [indice, setIndice] = useState(0);
  const total = slides.length;

  // paso = -1 (anterior) o +1 (siguiente). Sumar `total` evita negativos.
  function mover(paso) {
    setIndice((actual) => (actual + paso + total) % total);
  }

  return (
    <div aria-roledescription="carrusel">
      <p aria-live="polite">{slides[indice]}</p>
      <button type="button" aria-label="Anterior" onClick={() => mover(-1)}>
        ‹
      </button>
      <span>
        {indice + 1} / {total}
      </span>
      <button type="button" aria-label="Siguiente" onClick={() => mover(1)}>
        ›
      </button>
    </div>
  );
}
