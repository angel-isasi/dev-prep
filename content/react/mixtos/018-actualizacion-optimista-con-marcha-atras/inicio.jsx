// Actualización optimista con marcha atrás
//
// Un botón "Me gusta" con aria-pressed. Al hacer clic cambia AL INSTANTE y
// llama a guardar(nuevoValor). Si guardar falla, vuelve al valor anterior y
// muestra <p role="alert">No se guardó. Inténtalo otra vez.</p>
//
//   <MeGusta guardar={(valor) => fetch("/api/me-gusta", { method: "POST", body: String(valor) })} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function MeGusta({ guardar }) {
  // Tu código aquí
  return null;
}
