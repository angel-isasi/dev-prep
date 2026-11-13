import { useEffect, useState } from "react";

const ESTADO_FINAL = "entregado";

export function EstadoPedido({ consultar, cada = 1000 }) {
  const [estado, setEstado] = useState("preparando");

  useEffect(() => {
    // Condición de parada: si ya terminó, no se crea ningún intervalo.
    if (estado === ESTADO_FINAL) return;

    const id = setInterval(async () => {
      try {
        setEstado(await consultar());
      } catch {
        // Falló esta consulta: se reintenta en la siguiente vuelta.
      }
    }, cada);

    return () => clearInterval(id);
  }, [estado, consultar, cada]);

  return <p>Tu pedido está: {estado}</p>;
}
