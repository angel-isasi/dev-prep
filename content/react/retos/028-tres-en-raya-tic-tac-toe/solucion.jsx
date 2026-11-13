import { useState } from "react";

// Las 8 formas de ganar: 3 filas, 3 columnas y 2 diagonales (índices 0 a 8).
const LINEAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function calcularGanador(casillas) {
  for (const [a, b, c] of LINEAS) {
    if (casillas[a] && casillas[a] === casillas[b] && casillas[a] === casillas[c]) {
      return casillas[a];
    }
  }
  return null;
}

export function TresEnRaya() {
  const [casillas, setCasillas] = useState(Array(9).fill(null));

  // Todo esto es estado derivado: se calcula a partir de las casillas.
  const fichas = casillas.filter(Boolean).length;
  const turno = fichas % 2 === 0 ? "X" : "O";
  const ganador = calcularGanador(casillas);
  const empate = !ganador && fichas === 9;

  function jugar(indice) {
    if (casillas[indice] || ganador) return;
    const copia = [...casillas];
    copia[indice] = turno;
    setCasillas(copia);
  }

  let mensaje = `Turno de ${turno}`;
  if (ganador) mensaje = `Ganó ${ganador}`;
  else if (empate) mensaje = "Empate";

  return (
    <div>
      <p aria-live="polite">{mensaje}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 3rem)", gap: 4 }}>
        {casillas.map((valor, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Casilla ${i + 1}`}
            style={{ height: "3rem" }}
            onClick={() => jugar(i)}
          >
            {valor}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setCasillas(Array(9).fill(null))}>
        Reiniciar
      </button>
    </div>
  );
}
