// Cupones de Café Altura y sus reglas. Todo en céntimos.

/**
 * Cada cupón: compra mínima (minSubtotal), cuánto descuenta según el subtotal
 * (getDiscount) y si hace el envío gratis (freeShipping).
 */
export const COUPONS = {
  CAFE10: { minSubtotal: 0, getDiscount: (subtotal) => Math.round(subtotal * 0.1), freeShipping: false },
  BIENVENIDA20: { minSubtotal: 10000, getDiscount: () => 2000, freeShipping: false },
  ENVIOGRATIS: { minSubtotal: 0, getDiscount: () => 0, freeShipping: true },
};

/** " cafe10 " -> "CAFE10" */
export function normalizeCode(code) {
  // TODO
  return code;
}

/**
 * Revisa si un código se puede aplicar con el subtotal actual.
 * @returns {{ code: string } | { error: string }}
 *   { code: "CAFE10" } si se puede aplicar, o { error: "Cupón no válido." } (o el de compra mínima).
 */
export function checkCoupon(rawCode, subtotal) {
  // TODO
  return { error: "Cupón no válido." };
}
