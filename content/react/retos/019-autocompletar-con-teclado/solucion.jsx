import { useState } from "react";

export function Autocompletar({ opciones, onElegir }) {
  const [texto, setTexto] = useState("");
  const [indice, setIndice] = useState(-1); // -1 = ninguna resaltada
  const [abierto, setAbierto] = useState(false);

  // Estado derivado: las sugerencias salen del texto en cada render.
  const buscado = texto.toLowerCase();
  const sugerencias = buscado
    ? opciones.filter((opcion) => opcion.toLowerCase().startsWith(buscado))
    : [];
  const mostrarLista = abierto && sugerencias.length > 0;

  function escribir(evento) {
    setTexto(evento.target.value);
    setIndice(-1);
    setAbierto(true);
  }

  function elegir(opcion) {
    setTexto(opcion);
    setIndice(-1);
    setAbierto(false);
    onElegir(opcion);
  }

  function alPresionarTecla(evento) {
    if (evento.key === "ArrowDown") {
      evento.preventDefault(); // que el cursor no salte al final del input
      setIndice((i) => Math.min(i + 1, sugerencias.length - 1));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (evento.key === "Enter" && mostrarLista && indice >= 0) {
      elegir(sugerencias[indice]);
    } else if (evento.key === "Escape") {
      setTexto("");
      setIndice(-1);
      setAbierto(false);
    }
  }

  return (
    <div>
      <input
        role="combobox"
        aria-label="Distrito"
        aria-expanded={mostrarLista}
        aria-autocomplete="list"
        value={texto}
        onChange={escribir}
        onKeyDown={alPresionarTecla}
      />

      {mostrarLista && (
        <ul role="listbox">
          {sugerencias.map((opcion, i) => (
            <li
              key={opcion}
              role="option"
              aria-selected={i === indice}
              onClick={() => elegir(opcion)}
            >
              {opcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
