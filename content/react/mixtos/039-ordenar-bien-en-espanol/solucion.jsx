import { useMemo } from "react";

// El Collator conoce las reglas del español. Se crea una sola vez, fuera del
// componente, porque crearlo es más caro que usarlo.
// sensitivity: "base" ignora mayúsculas y tildes ("a" = "Á"), pero no la ñ.
export const comparar = new Intl.Collator("es", { sensitivity: "base" }).compare;

export function Distritos({ nombres }) {
  // toSorted devuelve una copia ordenada: la prop no se toca.
  const ordenados = useMemo(() => nombres.toSorted(comparar), [nombres]);

  return (
    <ul>
      {ordenados.map((nombre) => (
        <li key={nombre}>{nombre}</li>
      ))}
    </ul>
  );
}
