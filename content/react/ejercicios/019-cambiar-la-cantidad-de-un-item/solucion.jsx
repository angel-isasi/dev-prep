import { useState } from "react";

export function Cantidades({ inicial }) {
  const [items, setItems] = useState(inicial);

  // cambio: +1 o -1
  function cambiarCantidad(id, cambio) {
    setItems((actuales) =>
      actuales.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, item.cantidad + cambio) } // copia con la cantidad nueva
          : item // los demás quedan igual
      )
    );
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.nombre} x{item.cantidad}
          <button aria-label={`Menos ${item.nombre}`} onClick={() => cambiarCantidad(item.id, -1)}>
            −
          </button>
          <button aria-label={`Más ${item.nombre}`} onClick={() => cambiarCantidad(item.id, 1)}>
            +
          </button>
        </li>
      ))}
    </ul>
  );
}
