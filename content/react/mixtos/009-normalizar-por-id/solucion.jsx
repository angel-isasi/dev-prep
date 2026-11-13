import { useMemo } from "react";

// [{ id: "p1", ... }] -> { p1: { id: "p1", ... } }
export function porId(lista) {
  return Object.fromEntries(lista.map((item) => [item.id, item]));
}

export function DetallePedido({ pedido, pizzas }) {
  // Solo se reconstruye el índice si cambia `pizzas`.
  const catalogo = useMemo(() => porId(pizzas), [pizzas]);

  return (
    <ul>
      {pedido.map((id) => (
        <li key={id}>{catalogo[id]?.nombre ?? "Pizza no disponible"}</li>
      ))}
    </ul>
  );
}
