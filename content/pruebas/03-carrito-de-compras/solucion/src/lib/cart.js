// Estado del carrito (reducer) y cálculos. Funciones puras, todo en céntimos.
//
// Estado: { items: [{ productId: number, quantity: number }], couponCode: string | null }
import { findProduct } from "../products.js";
import { COUPONS } from "./coupons.js";

export const MAX_QUANTITY = 10;
export const SHIPPING_COST = 1000; // S/ 10.00
export const FREE_SHIPPING_FROM = 15000; // S/ 150.00

export const EMPTY_CART = { items: [], couponCode: null };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Cambia la cantidad de un producto sin mutar: devuelve un arreglo nuevo. */
function changeQuantity(items, productId, delta) {
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: clamp(item.quantity + delta, 1, MAX_QUANTITY) } : item,
  );
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "added": {
      const exists = state.items.some((item) => item.productId === action.productId);
      const items = exists
        ? changeQuantity(state.items, action.productId, 1)
        : [...state.items, { productId: action.productId, quantity: 1 }];
      return { ...state, items };
    }
    case "increased":
      return { ...state, items: changeQuantity(state.items, action.productId, 1) };
    case "decreased":
      return { ...state, items: changeQuantity(state.items, action.productId, -1) };
    case "removed":
      return { ...state, items: state.items.filter((item) => item.productId !== action.productId) };
    case "couponApplied":
      return { ...state, couponCode: action.code };
    case "couponRemoved":
      return { ...state, couponCode: null };
    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

/**
 * Une cada línea con su producto del catálogo.
 * @returns {Array<{ product, quantity: number, lineTotal: number }>}
 */
export function getCartLines(items) {
  return items.map((item) => {
    const product = findProduct(item.productId);
    return { product, quantity: item.quantity, lineTotal: product.price * item.quantity };
  });
}

/**
 * Calcula el resumen.
 * @returns {{ subtotal: number, discount: number, shipping: number, total: number, missingForCoupon: number }}
 */
export function getTotals(items, couponCode) {
  const subtotal = getCartLines(items).reduce((sum, line) => sum + line.lineTotal, 0);
  const coupon = couponCode ? COUPONS[couponCode] : null;

  const missingForCoupon = coupon ? Math.max(coupon.minSubtotal - subtotal, 0) : 0;
  const couponApplies = coupon !== null && missingForCoupon === 0;

  // El descuento nunca puede ser mayor que el subtotal.
  const discount = couponApplies ? Math.min(coupon.getDiscount(subtotal), subtotal) : 0;
  const freeShipping = subtotal >= FREE_SHIPPING_FROM || (couponApplies && coupon.freeShipping);
  const shipping = subtotal === 0 || freeShipping ? 0 : SHIPPING_COST;

  return { subtotal, discount, shipping, total: subtotal - discount + shipping, missingForCoupon };
}
