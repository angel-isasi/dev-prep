import { createContext, useContext, useMemo, useReducer } from "react";

// Función pura: recibe la lista actual y una acción, devuelve una lista NUEVA.
export function reducerCarrito(items, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const existe = items.some((item) => item.id === accion.pizza.id);
      return existe
        ? items.map((item) =>
            item.id === accion.pizza.id ? { ...item, cantidad: item.cantidad + 1 } : item,
          )
        : [...items, { ...accion.pizza, cantidad: 1 }];
    }
    case "restar":
      return items
        .map((item) => (item.id === accion.id ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0);
    case "vaciar":
      return [];
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

const ContextoCarrito = createContext(null);

export function ProveedorCarrito({ children }) {
  const [items, despachar] = useReducer(reducerCarrito, []);

  // Los totales se derivan de items; useMemo evita crear un objeto nuevo en cada render.
  const valor = useMemo(() => {
    const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const unidades = items.reduce((suma, item) => suma + item.cantidad, 0);
    return { items, total, unidades, despachar };
  }, [items]);

  return <ContextoCarrito.Provider value={valor}>{children}</ContextoCarrito.Provider>;
}

export function useCarrito() {
  const contexto = useContext(ContextoCarrito);
  if (!contexto) throw new Error("useCarrito debe usarse dentro de ProveedorCarrito");
  return contexto;
}

export function Menu({ pizzas }) {
  const { despachar } = useCarrito();
  return pizzas.map((pizza) => (
    <button key={pizza.id} onClick={() => despachar({ tipo: "agregar", pizza })}>
      Agregar {pizza.nombre}
    </button>
  ));
}

export function ResumenCarrito() {
  const { items, total, unidades, despachar } = useCarrito();

  if (unidades === 0) return <p>Tu carrito está vacío.</p>;

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.nombre} x{item.cantidad}
            <button
              aria-label={`Quitar una ${item.nombre}`}
              onClick={() => despachar({ tipo: "restar", id: item.id })}
            >
              −
            </button>
          </li>
        ))}
      </ul>
      <p>
        {unidades} pizzas, total S/ {total}
      </p>
      <button onClick={() => despachar({ tipo: "vaciar" })}>Vaciar carrito</button>
    </div>
  );
}
