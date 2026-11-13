import { useReducer } from "react";

// Función pura: recibe el carrito y una acción, devuelve un carrito NUEVO.
export function carritoReducer(estado, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const existe = estado.some((item) => item.id === accion.producto.id);
      if (existe) {
        return estado.map((item) =>
          item.id === accion.producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...estado, { ...accion.producto, cantidad: 1 }];
    }
    case "quitar":
      return estado
        .map((item) => (item.id === accion.id ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0);
    case "vaciar":
      return [];
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function Carrito({ productos }) {
  const [carrito, dispatch] = useReducer(carritoReducer, []);

  // El total no se guarda: se calcula del carrito.
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  return (
    <div>
      {productos.map((producto) => (
        <button key={producto.id} onClick={() => dispatch({ tipo: "agregar", producto })}>
          Agregar {producto.nombre}
        </button>
      ))}

      <ul>
        {carrito.map((item) => (
          <li key={item.id}>
            {item.nombre} × {item.cantidad}
            <button
              aria-label={`Quitar ${item.nombre}`}
              onClick={() => dispatch({ tipo: "quitar", id: item.id })}
            >
              −
            </button>
          </li>
        ))}
      </ul>

      <p>Total: S/ {total.toFixed(2)}</p>
    </div>
  );
}
