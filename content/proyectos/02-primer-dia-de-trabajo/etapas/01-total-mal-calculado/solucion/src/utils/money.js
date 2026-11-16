// Utilidades de dinero. Todo se maneja en soles (PEN).

/** 38 -> "S/ 38.00", 9.5 -> "S/ 9.50" */
export function formatPrice(amount) {
  return `S/ ${amount.toFixed(2)}`;
}

/**
 * Total a cobrar de un pedido a partir de sus items: precio por cantidad.
 * Los items de la app de delivery no traen `quantity` cuando es 1 (ver src/data/orders.js).
 */
export function calcOrderTotal(items) {
  return items.reduce((total, item) => total + item.price * (item.quantity ?? 1), 0);
}
