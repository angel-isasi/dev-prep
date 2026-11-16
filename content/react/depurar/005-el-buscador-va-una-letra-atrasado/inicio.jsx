import { useState } from "react";

// Buscador de cursos
//
// Input controlado. Cada vez que el usuario escribe, avisa al padre con
// onBuscar(texto) usando el texto que hay AHORA en el input, para que filtre.
//
//   escribe "r", "re", "rea"  ->  onBuscar("r"), onBuscar("re"), onBuscar("rea")

export function Buscador({ onBuscar }) {
  const [texto, setTexto] = useState("");

  function alEscribir(e) {
    setTexto(e.target.value);
    onBuscar(texto);
  }

  return (
    <input
      type="search"
      placeholder="Buscar curso"
      value={texto}
      onChange={alEscribir}
    />
  );
}
