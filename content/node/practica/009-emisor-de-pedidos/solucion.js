import { EventEmitter } from "node:events";

export class Pedido extends EventEmitter {
  constructor(id) {
    super(); // inicializa EventEmitter (sin esto, `this` no existe todavía)
    this.id = id;
    this.estado = "creado";
  }

  /** Valida y aplica un cambio de estado; avisa con "cambioDeEstado". */
  cambiarEstado(esperado, nuevo) {
    if (this.estado !== esperado) {
      // Se lanza ANTES de tocar nada: el pedido queda como estaba.
      throw new Error(`No se puede pasar de "${this.estado}" a "${nuevo}"`);
    }
    const anterior = this.estado;
    this.estado = nuevo;
    this.emit("cambioDeEstado", { id: this.id, anterior, nuevo });
  }

  pagar(monto) {
    this.cambiarEstado("creado", "pagado");
    this.emit("pagado", { id: this.id, monto });
  }

  enviar() {
    this.cambiarEstado("pagado", "enviado");
    this.emit("enviado", { id: this.id });
  }

  entregar() {
    this.cambiarEstado("enviado", "entregado");
    this.emit("entregado", { id: this.id });
  }
}

export function registrarAvisos(pedido) {
  const avisos = [];
  // Cada oyente agrega su mensaje cuando el pedido emite el evento.
  pedido.on("pagado", ({ id, monto }) => avisos.push(`Pedido ${id}: pago recibido (S/ ${monto.toFixed(2)})`));
  pedido.on("enviado", ({ id }) => avisos.push(`Pedido ${id}: en camino`));
  pedido.on("entregado", ({ id }) => avisos.push(`Pedido ${id}: entregado`));
  return avisos; // se devuelve vacío y se llena después, con cada evento
}
