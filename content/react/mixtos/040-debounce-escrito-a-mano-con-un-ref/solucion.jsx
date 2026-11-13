import { useEffect, useRef, useState } from "react";

export function BuscadorConEspera({ onBuscar, espera = 300 }) {
  const [texto, setTexto] = useState("");
  // Id del temporizador pendiente. Es un ref: cambiarlo no provoca renders.
  const temporizador = useRef(null);

  function cambiar(evento) {
    const valor = evento.target.value;
    setTexto(valor); // el input responde al instante

    // Cancela la búsqueda anterior y programa otra con el texto nuevo.
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => onBuscar(valor), espera);
  }

  // Al desmontar, cancela lo que haya quedado pendiente.
  useEffect(() => () => clearTimeout(temporizador.current), []);

  return <input aria-label="Buscar" value={texto} onChange={cambiar} />;
}
