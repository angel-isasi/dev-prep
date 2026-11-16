import { useEffect, useState } from "react";

// Resultados de búsqueda
//
// Cada vez que cambia `consulta`, pide los resultados con buscar(consulta),
// que devuelve una promesa con un arreglo de textos, y los muestra en una lista.
// Siempre se deben ver los resultados de la consulta ACTUAL, aunque una
// respuesta anterior llegue más tarde.

export function Resultados({ consulta, buscar }) {
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    let vigente = true;
    buscar(consulta).then((datos) => setResultados(datos));
    return () => {
      vigente = false;
    };
  }, [consulta, buscar]);

  return (
    <ul>
      {resultados.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
}
