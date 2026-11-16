// Guardar y recuperar el carrito en localStorage.
import { EMPTY_CART } from "./cart.js";

export const STORAGE_KEY = "cafe-altura:cart";

/**
 * Lee el carrito guardado. Nunca lanza un error: si algo está mal, devuelve EMPTY_CART.
 * Descarta productos que no existen, limita las cantidades a MAX_QUANTITY y
 * descarta cupones desconocidos.
 */
export function loadCart() {
  // TODO
  return EMPTY_CART;
}

/** Guarda { items, couponCode } con la clave STORAGE_KEY. */
export function saveCart(state) {
  // TODO
}
