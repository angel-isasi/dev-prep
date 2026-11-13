// Evitar re-renders con memo y useCallback
//
// Este código YA FUNCIONA, pero cada clic en "Clics: N" vuelve a renderizar
// todas las filas aunque no cambiaron. Tu tarea: optimizarlo con `memo` y
// `useCallback` para que las filas NO se vuelvan a renderizar al contar clics.
// No cambies los textos ni lo que se exporta.
//
//   <Padre />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { memo, useCallback, useState } from "react";

// Cuenta cuántas veces se ejecuta Fila. Solo sirve para medir (y para los tests).
export let rendersHijo = 0;

// Tu código aquí: envuelve este componente con memo.
export function Fila({ texto, onBorrar }) {
  rendersHijo++;
  return (
    <li>
      {texto}{" "}
      <button type="button" onClick={() => onBorrar(texto)}>
        Borrar
      </button>
    </li>
  );
}

export function Padre() {
  const [clics, setClics] = useState(0);
  const [items, setItems] = useState(["a", "b"]);

  // Tu código aquí: esta función es nueva en cada render. Estabilízala con useCallback.
  const borrar = (texto) => {
    setItems((anteriores) => anteriores.filter((item) => item !== texto));
  };

  return (
    <div>
      <button type="button" onClick={() => setClics((c) => c + 1)}>
        Clics: {clics}
      </button>
      <ul>
        {items.map((item) => (
          <Fila key={item} texto={item} onBorrar={borrar} />
        ))}
      </ul>
    </div>
  );
}
