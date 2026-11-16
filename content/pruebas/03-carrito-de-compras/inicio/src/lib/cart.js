// Estado del carrito (reducer) y cálculos. Funciones puras, todo en céntimos.
//
// Estado: { items: [{ productId: number, quantity: number }], couponCode: string | null }

export const MAX_QUANTITY = 10;
export const SHIPPING_COST = 1000; // S/ 10.00
export const FREE_SHIPPING_FROM = 15000; // S/ 150.00

export const EMPTY_CART = { items: [], couponCode: null };

/**
 * Acciones sugeridas:
 *   { type: "added", productId }        agrega 1 (o crea la línea), sin pasar de MAX_QUANTITY
 *   { type: "increased", productId }
 *   { type: "decreased", productId }    nunca baja de 1
 *   { type: "removed", productId }
 *   { type: "couponApplied", code }
 *   { type: "couponRemoved" }
 * Devuelve SIEMPRE un estado nuevo: no modifiques el anterior.
 */
export function cartReducer(state, action) {
  // TODO
  return state;
}

/**
 * Une cada línea con su producto del catálogo.
 * @returns {Array<{ product, quantity: number, lineTotal: number }>}
 */
export function getCartLines(items) {
  // TODO: usa findProduct() de ../products.js
  return [];
}

/**
 * Calcula el resumen.
 * @returns {{ subtotal: number, discount: number, shipping: number, total: number, missingForCoupon: number }}
 *   missingForCoupon: cuánto falta para que el cupón aplicado tenga efecto (0 si ya aplica).
 */
export function getTotals(items, couponCode) {
  // TODO: usa COUPONS de ./coupons.js
  return { subtotal: 0, discount: 0, shipping: 0, total: 0, missingForCoupon: 0 };
}
