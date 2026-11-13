import { useEffect, useState } from "react";

export function MisPedidos({ api }) {
  const [texto, setTexto] = useState("Cargando…");

  useEffect(() => {
    let vigente = true;

    // El efecto no puede ser async, pero puede llamar a una función async.
    async function cargar() {
      try {
        const usuario = await api.usuario();
        // Esta línea espera a la anterior: necesita usuario.id.
        const pedidos = await api.pedidosDe(usuario.id);
        if (vigente) setTexto(`${usuario.nombre} tiene ${pedidos.length} pedidos`);
      } catch {
        if (vigente) setTexto("No pudimos cargar tus pedidos");
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [api]);

  return <p>{texto}</p>;
}
