import { useReducer } from "react";

export function carritoReducer(estado, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const existe = estado.some((item) => item.id === accion.item.id);
      if (existe) {
        // Copia el arreglo y SOLO el item que cambia.
        return estado.map((item) =>
          item.id === accion.item.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...estado, { ...accion.item, cantidad: 1 }];
    }
    case "quitar":
      return estado.filter((item) => item.id !== accion.id);
    case "vaciar":
      return [];
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function Carrito({ productos }) {
  const [items, dispatch] = useReducer(carritoReducer, []);

  return (
    <div>
      {productos.map((producto) => (
        <button key={producto.id} onClick={() => dispatch({ tipo: "agregar", item: producto })}>
          {`Agregar ${producto.nombre}`}
        </button>
      ))}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>{`${item.nombre} x${item.cantidad}`}</span>
            <button aria-label={`Quitar ${item.nombre}`} onClick={() => dispatch({ tipo: "quitar", id: item.id })}>
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ tipo: "vaciar" })}>Vaciar</button>
    </div>
  );
}
