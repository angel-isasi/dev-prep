import { useSyncExternalStore } from "react";

export class AlmacenCarrito {
  // El # los hace privados: solo el código de la clase puede leerlos.
  #items = [];
  #oyentes = new Set();

  // Funciones flecha como campos: `this` queda fijo en la instancia,
  // aunque React las reciba sueltas.
  suscribir = (fn) => {
    this.#oyentes.add(fn);
    return () => this.#oyentes.delete(fn);
  };

  leer = () => this.#items;

  agregar(item) {
    // Arreglo nuevo: la referencia cambia y React detecta el cambio.
    this.#items = [...this.#items, item];
    this.#oyentes.forEach((fn) => fn());
  }
}

export const carrito = new AlmacenCarrito();

export function Insignia({ almacen = carrito }) {
  const items = useSyncExternalStore(almacen.suscribir, almacen.leer);
  return <p>{items.length} en el carrito</p>;
}
