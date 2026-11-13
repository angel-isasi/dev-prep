// Un generador que reparte ids
//
// `generarIds(prefijo)` es una función generadora que entrega
// "prefijo-1", "prefijo-2", ... sin fin.
// `Mesas` usa uno para dar un id único a cada mesa que agregas.
//
//   const ids = generarIds("mesa");
//   ids.next().value; // "mesa-1"
//   ids.next().value; // "mesa-2"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useRef, useState } from "react";

export function* generarIds(prefijo) {
  // Tu código aquí
}

export function Mesas() {
  // Tu código aquí
  return null;
}
