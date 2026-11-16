// ¿Alcanza el pago?
//
// Recibe los precios de una compra (en soles, con céntimos) y el monto que
// pagó el cliente. Devuelve true si el pago cubre el total.
//
//   pagoCompleto([1.1, 2.2], 3.3)  ->  true

export function pagoCompleto(precios, pagado) {
  const total = precios.reduce((suma, precio) => suma + precio, 0);
  return pagado >= total;
}
