// Efecto que depende de una prop
//
// Pide el precio con `obtenerPrecio(tamano)` (devuelve una promesa) y lo
// muestra como "S/ {precio}". Mientras espera muestra "Calculando…".
// Vuelve a pedirlo cuando cambia `tamano`, sin dejar que una respuesta vieja
// pise a la nueva.
//
//   <PrecioRemoto tamano="M" obtenerPrecio={obtenerPrecio} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function PrecioRemoto({ tamano, obtenerPrecio }) {
  // Tu código aquí
  return null;
}
