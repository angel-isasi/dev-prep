// Emisor de eventos con hook de suscripción
//
// `bus.on(evento, fn)` registra un oyente y devuelve la función para quitarlo.
// `bus.emit(evento, dato)` avisa a todos los oyentes de ese evento.
// `useEvento` conecta el bus con React y `Avisos` muestra el último pedido.
//
//   const quitar = bus.on("pedido", (pizza) => console.log(pizza));
//   bus.emit("pedido", "Hawaiana"); // imprime "Hawaiana"
//   quitar();
//
//   <Avisos />  ->  "Último pedido: ninguno"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export const bus = {
  oyentes: {},
  on(evento, fn) {
    // Tu código aquí
  },
  emit(evento, dato) {
    // Tu código aquí
  },
};

export function useEvento(evento, manejar) {
  // Tu código aquí
}

export function Avisos() {
  // Tu código aquí
  return null;
}
