import { useState } from "react";

export function Carrito({ inicial }) {
  // `inicial` solo se usa en el primer render para llenar el estado.
  const [items, setItems] = useState(inicial);

  function quitar(id) {
    // filter devuelve un arreglo NUEVO sin la pizza de ese id.
    setItems((actuales) => actuales.filter((item) => item.id !== id));
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.nombre}
          <button aria-label={`Quitar ${item.nombre}`} onClick={() => quitar(item.id)}>
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
