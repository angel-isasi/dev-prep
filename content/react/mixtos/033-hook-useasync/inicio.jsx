// Hook useAsync
//
// Envuelve una función asíncrona y devuelve { fase, dato, error, ejecutar }.
// fase: "inicial" -> "cargando" -> "listo" o "error".
//
//   const { fase, dato, error, ejecutar } = useAsync(doble);
//   await ejecutar(21); // fase "listo", dato 42
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useCallback, useState } from "react";

export function useAsync(fn) {
  // Tu código aquí
}
