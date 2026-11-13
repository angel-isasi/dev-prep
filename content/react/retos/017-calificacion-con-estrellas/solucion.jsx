import { useState } from "react";

export function Estrellas({ total = 5, onCambio }) {
  const [valor, setValor] = useState(0); // la estrella elegida (0 = ninguna)
  const [hover, setHover] = useState(0); // la estrella bajo el mouse (0 = ninguna)

  // Si hay hover se muestra ese; si no, el elegido.
  const visible = hover || valor;

  // [1, 2, 3, 4, 5]
  const numeros = Array.from({ length: total }, (_, i) => i + 1);

  function elegir(n) {
    setValor(n);
    onCambio?.(n);
  }

  return (
    <div role="radiogroup" aria-label="Calificación">
      {numeros.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={n === 1 ? "1 estrella" : `${n} estrellas`}
          onClick={() => elegir(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          {n <= visible ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
