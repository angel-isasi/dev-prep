import { useEffect, useState } from "react";

export function usePizzaDelDia(obtener) {
  const [pizza, setPizza] = useState(null);

  useEffect(() => {
    // Bandera de "esta petición todavía importa".
    let vigente = true;

    obtener().then((datos) => {
      if (vigente) setPizza(datos);
    });

    // Limpieza: corre al desmontar o antes de repetir el efecto
    // (cuando cambia `obtener`). Marca la petición vieja como obsoleta.
    return () => {
      vigente = false;
    };
  }, [obtener]);

  return pizza;
}

export function PizzaDelDia({ obtener }) {
  const pizza = usePizzaDelDia(obtener);

  if (!pizza) return <p>Cargando la pizza del día…</p>;
  return <h2>Hoy: {pizza.nombre}</h2>;
}
