// Carrito completo con Context y reducer
//
// Un reducer puro decide cómo cambia el carrito, un Context lo reparte
// y los componentes solo leen y despachan acciones.
//
//   <ProveedorCarrito>
//     <Menu pizzas={[{ id: 1, nombre: "Margarita", precio: 28 }]} />
//     <ResumenCarrito />
//   </ProveedorCarrito>
//
//   reducerCarrito([], { tipo: "agregar", pizza }) -> [{ ...pizza, cantidad: 1 }]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { createContext, useContext, useMemo, useReducer } from "react";

export function reducerCarrito(items, accion) {
  // "agregar", "restar", "vaciar" y error si el tipo no existe
  return items;
}

export function ProveedorCarrito({ children }) {
  // useReducer + Context.Provider
  return children;
}

export function useCarrito() {
  // Lee el contexto (y lanza un error si no hay proveedor)
  return { items: [], total: 0, unidades: 0, despachar: () => {} };
}

export function Menu({ pizzas }) {
  // Un botón "Agregar {nombre}" por pizza
  return null;
}

export function ResumenCarrito() {
  // Lista, total y botón "Vaciar carrito"
  return null;
}
