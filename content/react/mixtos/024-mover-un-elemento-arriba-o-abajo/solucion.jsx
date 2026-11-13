import { useState } from "react";

export function mover(lista, indice, direccion) {
  const destino = indice + direccion;
  // Fuera de los límites: no hay cambio, devolvemos la misma referencia.
  if (destino < 0 || destino >= lista.length) return lista;

  const copia = [...lista];
  // Intercambio con desestructuración: [a, b] = [b, a]
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

export function ListaPasos({ pasosIniciales }) {
  const [pasos, setPasos] = useState(pasosIniciales);

  function moverPaso(indice, direccion) {
    setPasos((actuales) => mover(actuales, indice, direccion));
  }

  return (
    <ol>
      {pasos.map((paso, indice) => (
        <li key={paso}>
          <span>{paso}</span>
          <button aria-label={`Subir ${paso}`} disabled={indice === 0} onClick={() => moverPaso(indice, -1)}>
            Subir
          </button>
          <button
            aria-label={`Bajar ${paso}`}
            disabled={indice === pasos.length - 1}
            onClick={() => moverPaso(indice, 1)}
          >
            Bajar
          </button>
        </li>
      ))}
    </ol>
  );
}
