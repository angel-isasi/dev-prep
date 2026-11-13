// Hook useHistorial (deshacer y rehacer)
//
// Como un estado normal, pero recuerda el pasado y el futuro.
// Devuelve { valor, fijar, deshacer, rehacer, puedeDeshacer, puedeRehacer }.
// fijar() borra el futuro. deshacer/rehacer no hacen nada si no hay a dónde ir.
//
//   const { valor, fijar, deshacer, rehacer } = useHistorial("margarita");
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function useHistorial(inicial) {
  // Tu código aquí
}
