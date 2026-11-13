import { useRef, useState } from "react";

export function* generarIds(prefijo) {
  let n = 1;
  // Bucle infinito seguro: el generador se pausa en cada `yield`
  // y solo avanza cuando alguien llama a `next()`.
  while (true) {
    yield `${prefijo}-${n}`;
    n++;
  }
}

export function Mesas() {
  // El generador se crea una sola vez y sobrevive entre renders.
  const ids = useRef(null);
  ids.current ??= generarIds("mesa");

  const [mesas, setMesas] = useState([]);

  function agregar() {
    // Pedir el id aquí, en el manejador, y no dentro de setMesas.
    const id = ids.current.next().value;
    setMesas((lista) => [...lista, id]);
  }

  return (
    <div>
      <button onClick={agregar}>Agregar mesa</button>
      <ul>
        {mesas.map((mesa) => (
          <li key={mesa}>{mesa}</li>
        ))}
      </ul>
    </div>
  );
}
