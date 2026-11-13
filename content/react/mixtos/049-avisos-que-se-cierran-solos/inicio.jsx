// Avisos que se cierran solos
//
// useAvisos(duracion) devuelve { avisos, avisar, cerrar }. Cada aviso se
// cierra solo después de `duracion` ms (con su propio temporizador) o a mano.
// Avisos es un componente de ejemplo con el botón "Agregar pizza".
//
//   const { avisos, avisar, cerrar } = useAvisos(3000);
//   avisar("Pizza agregada"); // avisos: [{ id: 1, texto: "Pizza agregada" }]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useCallback, useEffect, useRef, useState } from "react";

export function useAvisos(duracion = 3000) {
  // Tu código aquí
  return { avisos: [], avisar: () => {}, cerrar: () => {} };
}

export function Avisos() {
  // Tu código aquí
  return null;
}
