// Árbol de carpetas (componente recursivo)
//
// Recibe `nodo` = { nombre, hijos? }. Si tiene hijos es una carpeta (un botón
// que se abre y se cierra); si no, es un archivo (un <li> simple).
// Para dibujar los hijos, el componente se usa a sí mismo.
//
//   const datos = { nombre: "src", hijos: [{ nombre: "app", hijos: [] }, { nombre: "README.md" }] };
//   <ul><Arbol nodo={datos} /></ul>
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function Arbol({ nodo }) {
  // Tu código aquí
  return null;
}
