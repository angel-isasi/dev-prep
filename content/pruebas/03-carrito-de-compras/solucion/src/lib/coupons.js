// Cupones de Café Altura y sus reglas. Todo en céntimos.
import { formatPrice } from "./money.js";

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
  return code.trim().toUpperCase();
}

/**
 * Revisa si un código se puede aplicar con el subtotal actual.
 * @returns {{ code: string } | { error: string }}
 */
export function checkCoupon(rawCode, subtotal) {
  const code = normalizeCode(rawCode);
  // Object.hasOwn evita que códigos como "TOSTRING" o "CONSTRUCTOR" encuentren algo heredado.
  if (!Object.hasOwn(COUPONS, code)) return { error: "Cupón no válido." };

  const { minSubtotal } = COUPONS[code];
  if (subtotal < minSubtotal) {
    return { error: `Este cupón requiere una compra mínima de ${formatPrice(minSubtotal)}.` };
  }
  return { code };
}
