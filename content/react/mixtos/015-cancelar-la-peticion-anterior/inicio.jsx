// Cancelar la petición anterior
//
// Cada vez que cambia `texto`, llama a buscar(texto, signal) con un
// AbortController nuevo y aborta la búsqueda anterior. Muestra los
// resultados en una <ul>. Ignora los errores "AbortError".
//
//   <Resultados texto="mar" buscar={(texto, signal) => fetch(`/api?q=${texto}`, { signal })...} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function Resultados({ texto, buscar }) {
  // Tu código aquí
  return null;
}
