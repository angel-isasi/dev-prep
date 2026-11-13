// Máquina de estados del pedido
//
// TRANSICIONES dice a qué estado lleva cada evento. siguiente(estado, evento)
// devuelve el nuevo estado, o el mismo si el evento no está permitido.
// Checkout usa siguiente como reducer y muestra "Paso: ..." y un botón por
// cada evento permitido.
//
//   siguiente("carrito", "pagar");     // "pago"
//   siguiente("carrito", "confirmar"); // "carrito"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useReducer } from "react";

export const TRANSICIONES = {
  carrito: { pagar: "pago" },
  pago: { confirmar: "confirmado", volver: "carrito" },
  confirmado: {},
};

export function siguiente(estado, evento) {
  // Tu código aquí
}

export function Checkout() {
  // Tu código aquí
  return null;
}
