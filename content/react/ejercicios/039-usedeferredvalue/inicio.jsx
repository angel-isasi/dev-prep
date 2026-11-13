// useDeferredValue
//
// El input responde al instante y la lista pesada se actualiza cuando puede.
// ListaPesada filtra sin distinguir mayúsculas (o muestra "Sin resultados")
// y va envuelta en memo. BuscadorFluido le pasa useDeferredValue(texto).
//
//   <BuscadorFluido items={["margarita", "marinara", "hawaiana"]} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { memo, useDeferredValue, useState } from "react";

export function ListaPesada({ texto, items }) {
  // Tu código aquí (y recuerda envolverla en memo)
  return null;
}

export function BuscadorFluido({ items }) {
  // Tu código aquí
  return null;
}
