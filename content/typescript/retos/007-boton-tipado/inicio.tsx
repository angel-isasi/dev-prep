// Botón con props tipadas
//
// Tipa las props del botón: variante (unión de 3 literales), children,
// onClick y deshabilitado. Renderiza un <button type="button"> con la clase
// "boton boton--<variante>".
//
//   <Boton variante="peligro" onClick={borrar}>Eliminar</Boton>
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import type { ReactNode } from "react";

// Cámbialo por una unión de literales: "primario", "secundario" o "peligro".
export type Variante = string;

export type BotonProps = {
  // Tu código aquí: variante, children, onClick y deshabilitado
};

export function Boton(props: BotonProps) {
  // Tu código aquí
  return null;
}
