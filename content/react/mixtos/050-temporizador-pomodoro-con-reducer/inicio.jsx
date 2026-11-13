// Temporizador Pomodoro con reducer
//
// Alterna bloques de trabajo y descanso (duraciones en segundos). La lógica
// vive en el reducer `pomodoro` ("alternar", "tic", "reiniciar"); el
// componente solo despacha un "tic" cada segundo mientras corre.
//
//   crearInicial({ trabajo: 3, descanso: 2 })
//   // { modo: "trabajo", restante: 3, corriendo: false, duraciones: { trabajo: 3, descanso: 2 } }
//   <Pomodoro trabajo={3} descanso={2} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useReducer } from "react";

export function crearInicial({ trabajo, descanso }) {
  // Tu código aquí
  return {};
}

export function pomodoro(estado, accion) {
  // "alternar", "tic", "reiniciar" y error si el tipo no existe
  return estado;
}

export function Pomodoro({ trabajo = 25 * 60, descanso = 5 * 60 }) {
  // useReducer + un useEffect con setInterval mientras corre
  return null;
}
