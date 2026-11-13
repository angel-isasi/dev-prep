// Componente controlado por su padre
//
// `Interruptor` NO tiene estado: recibe `activo` y avisa con `onCambio(!activo)`.
// Es un <button role="switch" aria-checked={activo}> con el texto "Delivery: sí/no".
// `Opciones` guarda el estado y muestra "Costo de envío: S/ 5" si está activo.
//
//   <Interruptor etiqueta="Delivery" activo={delivery} onCambio={setDelivery} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function Interruptor({ activo, onCambio, etiqueta }) {
  // Tu código aquí
  return null;
}

export function Opciones() {
  // Tu código aquí
  return null;
}
