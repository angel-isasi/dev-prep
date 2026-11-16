import { useState } from "react";

// Contador de asistentes
//
// "+1" suma una persona y "+2" suma dos de golpe (una pareja).
// Muestra "Asistentes: N".

export function Asistentes() {
  const [total, setTotal] = useState(0);

  function sumarUno() {
    setTotal(total + 1);
  }

  function sumarDos() {
    sumarUno();
    sumarUno();
  }

  return (
    <div>
      <p>Asistentes: {total}</p>
      <button onClick={sumarUno}>+1</button>
      <button onClick={sumarDos}>+2</button>
    </div>
  );
}
