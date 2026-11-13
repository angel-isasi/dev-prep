import { useState } from "react";

export function Contador({ min = 0, max = 10 }) {
  const [valor, setValor] = useState(min);

  function restar() {
    setValor((anterior) => Math.max(min, anterior - 1));
  }

  function sumar() {
    setValor((anterior) => Math.min(max, anterior + 1));
  }

  return (
    <div>
      <p aria-live="polite">Valor: {valor}</p>
      <button onClick={restar} disabled={valor === min}>
        -
      </button>
      <button onClick={sumar} disabled={valor === max}>
        +
      </button>
      <button onClick={() => setValor(min)}>Reiniciar</button>
    </div>
  );
}
