// Hook useRecurso con caché y reintentos
//
// useRecurso(url, { reintentos = 2, esperaBase = 500 }) pide la url y devuelve
// { datos, error, cargando, recargar }. Guarda los datos en una caché por url,
// reintenta los errores de red y 5xx con espera creciente (500 ms, 1000 ms...)
// y recargar() vuelve a pedir ignorando la caché.
//
//   const { datos, error, cargando, recargar } = useRecurso("/api/practica/tareas");
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useCallback, useEffect, useRef, useState } from "react";

const cache = new Map();

export function limpiarCache() {
  cache.clear();
}

export function useRecurso(url, { reintentos = 2, esperaBase = 500 } = {}) {
  // Tu código aquí
  return { datos: null, error: null, cargando: true, recargar: () => {} };
}
