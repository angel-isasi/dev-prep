// Estado fuera de React con useSyncExternalStore
//
// crearAlmacen(inicial) devuelve { leer, cambiar, suscribir }:
//   leer()            -> el valor actual
//   cambiar(nuevo)    -> guarda y avisa a todos los oyentes
//   suscribir(oyente) -> lo agrega y devuelve una función para quitarlo
// Visor muestra "Pedidos hoy: N" leyendo `almacen` con useSyncExternalStore.
//
//   almacen.cambiar(12);  // todos los <Visor /> muestran "Pedidos hoy: 12"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useSyncExternalStore } from "react";

export function crearAlmacen(inicial) {
  // Tu código aquí
}

export const almacen = crearAlmacen(0);

export function Visor() {
  // Tu código aquí
  return null;
}
