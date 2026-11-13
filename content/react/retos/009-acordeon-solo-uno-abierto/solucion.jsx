import { useState } from "react";

export function Acordeon({ items }) {
  // Índice del item abierto, o null si ninguno lo está.
  const [abierto, setAbierto] = useState(null);

  function alternar(i) {
    setAbierto((actual) => (actual === i ? null : i));
  }

  return (
    <div>
      {items.map((item, i) => (
        <section key={item.pregunta}>
          <h3>
            <button aria-expanded={abierto === i} onClick={() => alternar(i)}>
              {item.pregunta}
            </button>
          </h3>
          {abierto === i && <p>{item.respuesta}</p>}
        </section>
      ))}
    </div>
  );
}
