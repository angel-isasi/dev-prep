import { memo, useCallback, useState } from "react";

// Cuenta cuántas veces se ejecuta Fila. Solo sirve para medir (y para los tests).
export let rendersHijo = 0;

// memo: si las props son las mismas que en el render anterior, React se salta este componente.
export const Fila = memo(function Fila({ texto, onBorrar }) {
  rendersHijo++;
  return (
    <li>
      {texto}{" "}
      <button type="button" onClick={() => onBorrar(texto)}>
        Borrar
      </button>
    </li>
  );
});

export function Padre() {
  const [clics, setClics] = useState(0);
  const [items, setItems] = useState(["a", "b"]);

  // useCallback: la MISMA función en cada render (no depende de nada que cambie).
  const borrar = useCallback((texto) => {
    setItems((anteriores) => anteriores.filter((item) => item !== texto));
  }, []);

  return (
    <div>
      <button type="button" onClick={() => setClics((c) => c + 1)}>
        Clics: {clics}
      </button>
      <ul>
        {items.map((item) => (
          <Fila key={item} texto={item} onBorrar={borrar} />
        ))}
      </ul>
    </div>
  );
}
