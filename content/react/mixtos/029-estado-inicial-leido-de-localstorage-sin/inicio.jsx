// Estado inicial leído de localStorage sin romperse
//
// leerGuardado(clave, respaldo) lee y parsea lo guardado; si no hay nada o
// está corrupto, devuelve el respaldo sin lanzar error.
// Preferencias muestra un botón "Tema: claro" / "Tema: oscuro" que alterna
// el tema y lo guarda en localStorage["tema"] como JSON.
//
//   localStorage.setItem("tema", "{roto");
//   <Preferencias />   // arranca en "Tema: claro" en vez de romperse
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function leerGuardado(clave, respaldo) {
  // Tu código aquí
}

export function Preferencias() {
  // Tu código aquí
  return null;
}
