import { useEffect } from "react";

export function TituloPedido({ cantidad }) {
  // Corre después de pintar, y otra vez solo cuando cambia `cantidad`.
  useEffect(() => {
    document.title = cantidad > 0 ? `(${cantidad}) Padre Gino` : "Padre Gino";
  }, [cantidad]);

  return <p>{cantidad} en el carrito</p>;
}
