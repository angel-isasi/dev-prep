// Un oyente recibe el payload (los datos) de un evento.
export type Oyente<P> = (payload: P) => void;

// `Eventos` es un "mapa" de nombre de evento -> tipo de su payload, por ejemplo:
// { mensaje: { de: string; texto: string }; conectado: { usuario: string } }
export class Emisor<Eventos extends Record<string, unknown>> {
  // Por cada evento, su lista de oyentes (con el payload correcto).
  private oyentes: { [K in keyof Eventos]?: Oyente<Eventos[K]>[] } = {};

  // K es el nombre del evento; Eventos[K], el tipo de su payload.
  on<K extends keyof Eventos>(evento: K, oyente: Oyente<Eventos[K]>): () => void {
    const lista = this.oyentes[evento] ?? [];
    lista.push(oyente);
    this.oyentes[evento] = lista;
    // Devolvemos una función para darse de baja (como addEventListener + removeEventListener).
    return () => this.off(evento, oyente);
  }

  off<K extends keyof Eventos>(evento: K, oyente: Oyente<Eventos[K]>): void {
    const lista = this.oyentes[evento];
    if (lista) this.oyentes[evento] = lista.filter((o) => o !== oyente);
  }

  emit<K extends keyof Eventos>(evento: K, payload: Eventos[K]): void {
    // Copiamos la lista: si un oyente se da de baja mientras recorremos, no nos afecta.
    const lista = [...(this.oyentes[evento] ?? [])];
    for (const oyente of lista) oyente(payload);
  }
}
