// Hook useIntervalo
//
// Llama a `callback` cada `ms` milisegundos, usando SIEMPRE el callback más
// reciente. Cambiar el callback no reinicia el intervalo; cambiar `ms` sí.
// Con ms = null está pausado. Al desmontar, limpia el intervalo.
//
//   useIntervalo(() => setSegundos(segundos + 1), 1000);
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useRef } from "react";

export function useIntervalo(callback, ms) {
  // Tu código aquí
}
