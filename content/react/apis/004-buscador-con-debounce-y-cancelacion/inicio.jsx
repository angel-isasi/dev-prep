// Buscador con debounce y cancelación
//
// Un campo de búsqueda que pide "/api/practica/productos?q=<texto>" solo
// cuando pasan 400 ms sin escribir, y aborta la petición anterior si llega
// una búsqueda nueva.
//
//   <BuscadorProductos />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function BuscadorProductos() {
  const [texto, setTexto] = useState("");

  // Tu código aquí: el efecto con setTimeout + AbortController y los estados.

  return (
    <div>
      <input
        type="search"
        aria-label="Buscar productos"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
      />
    </div>
  );
}
