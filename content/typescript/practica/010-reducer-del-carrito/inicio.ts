// Reducer del carrito
//
// 1. Completa AccionCarrito con las acciones quitar, cambiarCantidad y vaciar.
// 2. asegurarNunca lanza un Error("Acción desconocida").
// 3. carritoReducer: un switch sobre accion.tipo que devuelve un estado NUEVO
//    (no modifiques `estado`). En el default, llama a asegurarNunca(accion).
//
//   carritoReducer({ items: [] }, { tipo: "agregar", producto: { id: 1, nombre: "Pan", precio: 0.5 } })
//     ->  { items: [{ id: 1, nombre: "Pan", precio: 0.5, cantidad: 1 }] }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface EstadoCarrito {
  items: ItemCarrito[];
}

export type AccionCarrito =
  | { tipo: "agregar"; producto: Producto };
  // Tu código aquí: quitar, cambiarCantidad y vaciar

export function asegurarNunca(valor: never): never {
  // Tu código aquí
}

export function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  // Tu código aquí
  return estado;
}
