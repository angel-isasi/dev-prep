// Eventos de un pedido
//
// Pedido extiende EventEmitter: cada método revisa el estado actual, lo cambia
// y emite su evento (y "cambioDeEstado"). Si el estado no es el correcto, lanza.
// registrarAvisos escucha los eventos con .on y llena un arreglo de mensajes.
//
//   const pedido = new Pedido(7);
//   pedido.on("pagado", (datos) => ...);   // datos = { id: 7, monto: 50 }
//   pedido.pagar(50);
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { EventEmitter } from "node:events";

export class Pedido extends EventEmitter {
  constructor(id) {
    super(); // obligatorio: prepara la parte de EventEmitter
    // Tu código aquí: guarda el id y el estado inicial
  }

  pagar(monto) {
    // Tu código aquí
  }

  enviar() {
    // Tu código aquí
  }

  entregar() {
    // Tu código aquí
  }
}

export function registrarAvisos(pedido) {
  // Tu código aquí
}
