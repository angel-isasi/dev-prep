// Emisor de eventos tipado
//
// Clase genérica Emisor<Eventos> con on, off y emit. `Eventos` dice qué
// payload lleva cada evento, y TypeScript debe revisar que emitas y escuches
// cada evento con su payload correcto.
//
//   type EventosChat = { mensaje: { de: string; texto: string }; escribiendo: boolean };
//   const chat = new Emisor<EventosChat>();
//   chat.on("mensaje", (m) => console.log(m.texto));   // m es { de, texto }
//   chat.emit("mensaje", { de: "Ana", texto: "Hola" });
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export type Oyente<P> = (payload: P) => void;

export class Emisor<Eventos extends Record<string, unknown>> {
  // Tu código aquí: guarda los oyentes de cada evento.

  // Cambia `string` y `any` por tipos que dependan de `Eventos`.
  on(evento: string, oyente: (payload: any) => void): () => void {
    // Tu código aquí
    return () => {};
  }

  off(evento: string, oyente: (payload: any) => void): void {
    // Tu código aquí
  }

  emit(evento: string, payload: any): void {
    // Tu código aquí
  }
}
