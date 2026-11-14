// Mensaje según el estado del pedido
//
// 1. Cambia `string` por una unión de los 5 estados:
//    "pendiente", "pagado", "enviado", "entregado", "cancelado".
// 2. mensajeDeEstado devuelve el mensaje de cada estado (mira el enunciado).
// 3. puedeCancelarse: true solo para "pendiente" y "pagado".
//
//   mensajeDeEstado("enviado")    ->  "Tu pedido está en camino"
//   puedeCancelarse("enviado")    ->  false
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export type EstadoPedido = string;

export function mensajeDeEstado(estado: EstadoPedido): string {
  // Tu código aquí
  return "";
}

export function puedeCancelarse(estado: EstadoPedido): boolean {
  // Tu código aquí
  return false;
}
