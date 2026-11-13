// Una clase como almacén compartido
//
// `AlmacenCarrito` guarda items en un campo privado y avisa a sus oyentes
// cuando cambian. `Insignia` lo lee con useSyncExternalStore.
//
//   const almacen = new AlmacenCarrito();
//   almacen.agregar("Margarita");
//   almacen.leer();                  // ["Margarita"]
//   <Insignia almacen={almacen} />   // "1 en el carrito"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useSyncExternalStore } from "react";

export class AlmacenCarrito {
  // Tu código aquí: #items, #oyentes, suscribir, leer y agregar
}

export const carrito = new AlmacenCarrito();

export function Insignia({ almacen = carrito }) {
  // Tu código aquí
  return null;
}
