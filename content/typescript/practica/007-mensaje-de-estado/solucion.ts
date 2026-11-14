// Unión de literales: el tipo acepta SOLO estos 5 textos exactos.
export type EstadoPedido = "pendiente" | "pagado" | "enviado" | "entregado" | "cancelado";

// Record<EstadoPedido, string> obliga a tener un mensaje para CADA estado:
// si agregas un estado a la unión y olvidas su mensaje, tsc te avisa aquí.
const MENSAJES: Record<EstadoPedido, string> = {
  pendiente: "Esperando el pago",
  pagado: "Pago recibido, estamos preparando tu pedido",
  enviado: "Tu pedido está en camino",
  entregado: "Pedido entregado",
  cancelado: "Pedido cancelado",
};

export function mensajeDeEstado(estado: EstadoPedido): string {
  return MENSAJES[estado];
}

export function puedeCancelarse(estado: EstadoPedido): boolean {
  return estado === "pendiente" || estado === "pagado";
}
