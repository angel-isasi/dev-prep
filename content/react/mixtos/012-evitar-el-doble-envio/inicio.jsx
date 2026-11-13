// Evitar el doble envío
//
// Un botón "Pagar" que llama a pagar() una sola vez aunque hagan varios clics.
// Mientras espera: "Pagando…" y deshabilitado. Al terminar (bien o mal): "Pagar".
// Si falla: <p role="alert">No se pudo procesar el pago</p>
//
//   <BotonPagar pagar={() => fetch("/api/pagar", { method: "POST" })} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function BotonPagar({ pagar }) {
  // Tu código aquí
  return null;
}
