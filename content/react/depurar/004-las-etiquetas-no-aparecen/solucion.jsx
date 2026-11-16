import { useState } from "react";

// Elegir etiquetas
//
// Muestra un botón por cada sugerencia. Al hacer clic, la etiqueta se agrega
// a la lista de elegidas, que se muestra como "Elegidas: React, CSS".
// Si no hay ninguna, muestra "Elegidas: ninguna".

export function Etiquetas({ sugerencias }) {
  const [elegidas, setElegidas] = useState([]);

  function elegir(etiqueta) {
    const nuevas = [...elegidas, etiqueta]; // un arreglo nuevo, sin tocar el del estado
    setElegidas(nuevas);
  }

  return (
    <div>
      {sugerencias.map((s) => (
        <button key={s} onClick={() => elegir(s)}>
          {s}
        </button>
      ))}
      <p>Elegidas: {elegidas.length === 0 ? "ninguna" : elegidas.join(", ")}</p>
    </div>
  );
}
