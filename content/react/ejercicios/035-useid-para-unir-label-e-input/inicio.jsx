// useId para unir label e input
//
// Un <label> y un <input> (uno al lado del otro) unidos con htmlFor + id.
// El id lo genera useId, así cada Campo tiene uno distinto. Las demás props
// (type, placeholder, onChange...) pasan directo al input.
//
//   <Campo etiqueta="Teléfono" type="tel" />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useId } from "react";

export function Campo({ etiqueta, ...props }) {
  // Tu código aquí
  return null;
}
