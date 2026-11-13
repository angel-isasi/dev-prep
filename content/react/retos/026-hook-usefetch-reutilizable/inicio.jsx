// Hook useFetch reutilizable
//
// Recibe una url, la pide con fetch y devuelve { datos, error, cargando }.
// Si la url cambia, vuelve a pedir. Una respuesta vieja que llega tarde
// no debe pisar a la nueva.
//
//   const { datos, error, cargando } = useFetch("/api/noticias");
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function useFetch(url) {
  // Tu código aquí
  return { datos: null, error: null, cargando: true };
}
