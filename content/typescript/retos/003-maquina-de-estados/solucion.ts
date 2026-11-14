// Unión discriminada: todas las variantes tienen `estado` (el discriminante)
// y cada una trae SOLO los datos que tienen sentido en ese estado.
export type Pedido =
  | { estado: "pendiente"; id: string }
  | { estado: "pagado"; id: string; pagadoEn: string }
  | { estado: "enviado"; id: string; pagadoEn: string; codigoSeguimiento: string }
  | { estado: "entregado"; id: string; pagadoEn: string; codigoSeguimiento: string }
  | { estado: "cancelado"; id: string; motivo: string };

export type Accion =
  | { tipo: "pagar"; fecha: string }
  | { tipo: "enviar"; codigoSeguimiento: string }
  | { tipo: "entregar" }
  | { tipo: "cancelar"; motivo: string };

export function transicionar(pedido: Pedido, accion: Accion): Pedido {
  // Dentro de cada `if`, TypeScript sabe qué variante es `pedido` y cuál `accion`.
  if (pedido.estado === "pendiente" && accion.tipo === "pagar") {
    return { estado: "pagado", id: pedido.id, pagadoEn: accion.fecha };
  }
  if (pedido.estado === "pagado" && accion.tipo === "enviar") {
    return { ...pedido, estado: "enviado", codigoSeguimiento: accion.codigoSeguimiento };
  }
  if (pedido.estado === "enviado" && accion.tipo === "entregar") {
    return { ...pedido, estado: "entregado" };
  }
  if ((pedido.estado === "pendiente" || pedido.estado === "pagado") && accion.tipo === "cancelar") {
    return { estado: "cancelado", id: pedido.id, motivo: accion.motivo };
  }
  throw new Error(`No se puede ${accion.tipo} un pedido ${pedido.estado}`);
}

export function mensajeDeEstado(pedido: Pedido): string {
  switch (pedido.estado) {
    case "pendiente":
      return "Pendiente de pago";
    case "pagado":
      return `Pagado el ${pedido.pagadoEn}`;
    case "enviado":
      return `En camino (seguimiento ${pedido.codigoSeguimiento})`;
    case "entregado":
      return "Entregado";
    case "cancelado":
      return `Cancelado: ${pedido.motivo}`;
    default: {
      // Si mañana agregas un estado y olvidas un `case`, esta línea no compila.
      const sinCubrir: never = pedido;
      return sinCubrir;
    }
  }
}
