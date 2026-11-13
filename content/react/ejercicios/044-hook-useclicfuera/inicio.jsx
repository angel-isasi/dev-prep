// Hook useClicFuera
//
// useClicFuera(ref, alHacerClicFuera) escucha "mousedown" en el document y
// llama a alHacerClicFuera() si el clic fue fuera del elemento de `ref`.
// Limpia el listener al desmontar.
// Desplegable empieza mostrando "Opciones" y al hacer clic fuera muestra "Cerrado".
//
//   const ref = useRef(null);
//   useClicFuera(ref, () => setAbierto(false));
//   return <div ref={ref}>...</div>;
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useRef, useState } from "react";

export function useClicFuera(ref, alHacerClicFuera) {
  // Tu código aquí
}

export function Desplegable() {
  // Tu código aquí
  return null;
}
