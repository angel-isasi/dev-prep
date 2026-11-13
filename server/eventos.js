// Server-Sent Events: una conexión abierta por pestaña del navegador por donde
// el servidor "empuja" avisos (tests corriendo, resultado nuevo...).
// En el navegador se escucha con `new EventSource("/api/eventos")`.

export function crearEventos() {
  /** @type {Set<import("express").Response>} */
  const clientes = new Set();

  // Un comentario cada 25 s para que nada cierre la conexión por inactividad.
  const latido = setInterval(() => {
    for (const res of clientes) res.write(": latido\n\n");
  }, 25_000);
  latido.unref();

  return {
    manejador(req, res) {
      res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.flushHeaders();
      res.write("retry: 2000\n\n"); // si se corta, el navegador reintenta a los 2 s
      clientes.add(res);
      req.on("close", () => clientes.delete(res));
    },

    /** Envía un evento con nombre y datos (JSON) a todas las pestañas abiertas. */
    emitir(tipo, datos) {
      const mensaje = `event: ${tipo}\ndata: ${JSON.stringify(datos)}\n\n`;
      for (const res of clientes) res.write(mensaje);
    },

    get conectados() {
      return clientes.size;
    },
  };
}
