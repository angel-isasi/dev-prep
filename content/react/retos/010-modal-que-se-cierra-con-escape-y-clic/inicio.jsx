// Modal que se cierra con Escape y clic afuera
//
// Props: abierto, titulo, onCerrar, children. Si está abierto pinta un fondo
// (data-testid="fondo") y dentro un role="dialog" con el título, el contenido
// y un botón "Cerrar". Llama a onCerrar con Escape, clic en el fondo o "Cerrar",
// pero NO con un clic dentro de la caja.
//
//   <Modal abierto titulo="Votar" onCerrar={() => setMostrar(false)}>
//     <p>¿Confirmas tu voto?</p>
//   </Modal>
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect } from "react";

export function Modal({ abierto, titulo, onCerrar, children }) {
  // Tu código aquí
  return null;
}
