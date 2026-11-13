// Hook useTecla
//
// useTecla(tecla, accion) escucha "keydown" en el document y llama a
// accion(evento) cuando evento.key === tecla. Quita el listener al desmontar.
// Ayuda alterna el texto "Atajos de teclado" cada vez que se presiona "?".
//
//   useTecla("Escape", cerrar);
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useCallback, useEffect, useState } from "react";

export function useTecla(tecla, accion) {
  // Tu código aquí
}

export function Ayuda() {
  // Tu código aquí
  return null;
}
