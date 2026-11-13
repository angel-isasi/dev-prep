// Reducer puro del carrito
//
// carritoReducer(estado, accion): acciones "agregar", "quitar" y "vaciar".
// Cualquier otra lanza Error("Acción desconocida: ..."). Nunca muta el estado.
// Carrito({ productos }): botones "Agregar X", lista "Margarita x2" con botón
// Quitar (aria-label "Quitar Margarita") y botón "Vaciar". Usa useReducer.
//
//   carritoReducer([], { tipo: "agregar", item: { id: "m", nombre: "Margarita", precio: 28 } })
//   // [{ id: "m", nombre: "Margarita", precio: 28, cantidad: 1 }]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useReducer } from "react";

export function carritoReducer(estado, accion) {
  // Tu código aquí
  return estado;
}

export function Carrito({ productos }) {
  // Tu código aquí
  return null;
}
