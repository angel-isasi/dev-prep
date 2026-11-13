import { useEffect, useState } from "react";

export const bus = {
  oyentes: {},

  on(evento, fn) {
    // Si es el primer oyente de este evento, crea su Set.
    (this.oyentes[evento] ??= new Set()).add(fn);
    // Devuelve la función que deshace lo que acabamos de hacer.
    return () => this.oyentes[evento].delete(fn);
  },

  emit(evento, dato) {
    // `?.` evita el error si nadie escucha este evento.
    this.oyentes[evento]?.forEach((fn) => fn(dato));
  },
};

export function useEvento(evento, manejar) {
  useEffect(() => {
    const quitar = bus.on(evento, manejar);
    // Limpieza: se ejecuta al desmontar o antes de volver a suscribirse.
    return () => {
      quitar();
    };
  }, [evento, manejar]);
}

export function Avisos() {
  const [ultimo, setUltimo] = useState("ninguno");
  // `setUltimo` es estable: React garantiza que no cambia entre renders.
  useEvento("pedido", setUltimo);
  return <p>Último pedido: {ultimo}</p>;
}
