// Modal con portal
//
// `Modal` se dibuja con createPortal directamente en document.body, con
// role="dialog", aria-modal="true", sus children y un botón "Cerrar".
// `Pagina` (<div id="pagina">) tiene un botón "Ver pedido" que lo abre y
// muestra "Tu pedido" adentro.
//
//   <Pagina />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";
import { createPortal } from "react-dom";

export function Modal({ children, onCerrar }) {
  // Tu código aquí
  return null;
}

export function Pagina() {
  // Tu código aquí
  return null;
}
