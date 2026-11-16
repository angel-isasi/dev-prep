// Utilidades de dinero. Todo se maneja en soles (PEN).

/** 38 -> "S/ 38.00", 9.5 -> "S/ 9.50" */
export function formatPrice(amount) {
  return `S/ ${amount.toFixed(2)}`;
}

/** Total a cobrar de un pedido a partir de sus items. */
export function calcOrderTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}
