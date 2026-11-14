// Máquina de estados de un pedido
//
// Completa la unión discriminada `Pedido` y escribe:
// - transicionar(pedido, accion): devuelve el pedido en su nuevo estado
//   o lanza un error si la transición no está permitida.
// - mensajeDeEstado(pedido): un texto para mostrar al cliente.
//
//   transicionar({ estado: "pendiente", id: "P-1" }, { tipo: "pagar", fecha: "2026-11-14" })
//   // { estado: "pagado", id: "P-1", pagadoEn: "2026-11-14" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Completa la unión: agrega las variantes "pagado", "enviado", "entregado"
// y "cancelado", cada una con sus datos (mira el enunciado).
export type Pedido =
  | { estado: "pendiente"; id: string };

export type Accion =
  | { tipo: "pagar"; fecha: string }
  | { tipo: "enviar"; codigoSeguimiento: string }
  | { tipo: "entregar" }
  | { tipo: "cancelar"; motivo: string };

export function transicionar(pedido: Pedido, accion: Accion): Pedido {
  // Tu código aquí
  return pedido;
}

export function mensajeDeEstado(pedido: Pedido): string {
  // Tu código aquí
  return "";
}
