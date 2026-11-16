// Guardar y recuperar el carrito en localStorage.
import { findProduct } from "../products.js";
import { EMPTY_CART, MAX_QUANTITY } from "./cart.js";
import { COUPONS } from "./coupons.js";

export const STORAGE_KEY = "cafe-altura:cart";

const isValidItem = (item) =>
  item !== null &&
  typeof item === "object" &&
  findProduct(item.productId) !== undefined &&
  Number.isInteger(item.quantity) &&
  item.quantity > 0;

/**
 * Lee el carrito guardado. Nunca lanza un error: si algo está mal, devuelve EMPTY_CART.
 * Lo que viene de localStorage puede ser de una versión vieja o haber sido editado a mano:
 * se revisa todo antes de usarlo.
 */
export function loadCart() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data || !Array.isArray(data.items)) return EMPTY_CART;

    const items = data.items
      .filter(isValidItem)
      .map((item) => ({ productId: item.productId, quantity: Math.min(item.quantity, MAX_QUANTITY) }));
    const couponCode = Object.hasOwn(COUPONS, data.couponCode ?? "") ? data.couponCode : null;

    return { items, couponCode };
  } catch {
    // JSON corrupto o localStorage bloqueado (modo privado de algunos navegadores).
    return EMPTY_CART;
  }
}

/** Guarda { items, couponCode } con la clave STORAGE_KEY. */
export function saveCart({ items, couponCode }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, couponCode }));
  } catch {
    // Sin espacio o sin permiso: el carrito sigue funcionando, solo que no se guarda.
  }
}
