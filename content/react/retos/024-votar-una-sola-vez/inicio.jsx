// Votar una sola vez
//
// Muestra un botón "Votar por <título>" por cada corto. Al votar llama a
// onVotar(id), que es asíncrona y puede fallar. Mientras se envía y después
// de votar con éxito, todos los botones quedan deshabilitados. Si falla,
// muestra un error con role="alert" y permite reintentar.
//
//   <Votacion
//     cortos={[{ id: 1, titulo: "Bajo la arena" }, { id: 2, titulo: "Luz de desierto" }]}
//     onVotar={async (id) => { /* llamada al servidor */ }}
//   />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function Votacion({ cortos, onVotar }) {
  // Tu código aquí
  return null;
}
