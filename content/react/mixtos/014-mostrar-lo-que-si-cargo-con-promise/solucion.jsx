import { useEffect, useState } from "react";

export function Tablero({ fuentes }) {
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    let vigente = true;

    // allSettled nunca se rechaza: espera a todas y describe cómo terminó cada una.
    Promise.allSettled(fuentes.map((fuente) => fuente.cargar())).then((lista) => {
      if (vigente) setResultados(lista);
    });

    return () => {
      vigente = false;
    };
  }, [fuentes]);

  if (!resultados) return <p>Cargando…</p>;

  return (
    <ul>
      {resultados.map((resultado, i) => (
        <li key={fuentes[i].nombre}>
          {fuentes[i].nombre}: {resultado.status === "fulfilled" ? resultado.value : "no disponible"}
        </li>
      ))}
    </ul>
  );
}
