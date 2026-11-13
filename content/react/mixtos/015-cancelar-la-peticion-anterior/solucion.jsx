import { useEffect, useState } from "react";

export function Resultados({ texto, buscar }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const control = new AbortController();

    buscar(texto, control.signal)
      .then(setItems)
      .catch((error) => {
        // Una cancelación no es un error real: la ignoramos.
        if (error.name !== "AbortError") setItems([]);
      });

    // Corre antes del siguiente efecto (cuando cambia `texto`) y al desmontar.
    return () => control.abort();
  }, [texto, buscar]);

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
