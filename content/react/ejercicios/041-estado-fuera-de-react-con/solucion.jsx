import { useSyncExternalStore } from "react";

export function crearAlmacen(inicial) {
  // Variables privadas: solo las ven estas tres funciones (closure).
  let estado = inicial;
  const oyentes = new Set();

  return {
    leer: () => estado,
    cambiar: (nuevo) => {
      estado = nuevo;
      oyentes.forEach((oyente) => oyente()); // avisa a todos
    },
    suscribir: (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente); // función para desuscribirse
    },
  };
}

export const almacen = crearAlmacen(0);

export function Visor() {
  // React se suscribe al montar, se desuscribe al desmontar
  // y vuelve a renderizar cuando un oyente avisa que algo cambió.
  const valor = useSyncExternalStore(almacen.suscribir, almacen.leer);
  return <p>Pedidos hoy: {valor}</p>;
}
