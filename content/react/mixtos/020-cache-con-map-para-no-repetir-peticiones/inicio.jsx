// Caché con Map para no repetir peticiones
//
// obtenerConCache(clave, cargar): guarda en un Map la PROMESA de cargar(clave)
// y la reutiliza en las siguientes llamadas con la misma clave.
// Detalle({ id, cargar }): <p>Cargando…</p> y luego el dato.
//
//   <Detalle id={1} cargar={async (id) => `Pizza ${id}`} />  -> "Pizza 1"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function obtenerConCache(clave, cargar) {
  // Tu código aquí
}

export function Detalle({ id, cargar }) {
  // Tu código aquí
  return null;
}
