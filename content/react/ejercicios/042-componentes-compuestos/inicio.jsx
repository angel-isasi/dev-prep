// Componentes compuestos
//
// `Opciones` (role="radiogroup") comparte { valor, onCambio } por contexto.
// `Opciones.Item` (role="radio") lo lee: aria-checked si es el elegido y
// al hacer clic llama onCambio(suValor). Fuera de <Opciones> lanza un error.
// `Masa` usa el grupo para elegir entre "Delgada" y "Gruesa".
//
//   <Opciones valor={masa} onCambio={setMasa}>
//     <Opciones.Item valor="delgada">Delgada</Opciones.Item>
//   </Opciones>
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { createContext, useContext, useState } from "react";

export function Opciones({ valor, onCambio, children }) {
  // Tu código aquí
  return null;
}

Opciones.Item = function Item({ valor, children }) {
  // Tu código aquí
  return null;
};

export function Masa() {
  // Tu código aquí
  return null;
}
