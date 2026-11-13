// Contador con useReducer
//
// `reducer(estado, accion)` decide cómo cambia el estado:
//   { tipo: "sumar", paso }  -> suma paso (o 1 si no hay paso)
//   { tipo: "reiniciar" }    -> vuelve a 0
//   otro tipo                -> lanza un error
// `Contador` muestra "Cuenta: N" y los botones "+5" y "Reiniciar".
//
//   <Contador />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useReducer } from "react";

export function reducer(estado, accion) {
  // Tu código aquí
}

export function Contador() {
  // Tu código aquí
  return null;
}
