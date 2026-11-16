// Hook del carrito: estado con useReducer, persistencia y acciones listas para usar.
import { useEffect, useReducer } from "react";
import { cartReducer, getCartLines, getTotals } from "../lib/cart.js";
import { checkCoupon } from "../lib/coupons.js";
import { loadCart, saveCart } from "../lib/storage.js";

export function useCart() {
  // El tercer argumento (loadCart) se ejecuta una sola vez, al montar:
  // así no leemos localStorage en cada render.
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    saveCart(state);
  }, [state]);

  // Estado derivado: las líneas y los totales se calculan, no se guardan.
  const lines = getCartLines(state.items);
  const totals = getTotals(state.items, state.couponCode);

  const quantityOf = (productId) => state.items.find((item) => item.productId === productId)?.quantity ?? 0;

  /** Devuelve el mensaje de error, o "" si el cupón se aplicó. */
  function applyCoupon(rawCode) {
    const result = checkCoupon(rawCode, totals.subtotal);
    if (result.error) return result.error;
    dispatch({ type: "couponApplied", code: result.code });
    return "";
  }

  return {
    lines,
    totals,
    couponCode: state.couponCode,
    quantityOf,
    add: (productId) => dispatch({ type: "added", productId }),
    increase: (productId) => dispatch({ type: "increased", productId }),
    decrease: (productId) => dispatch({ type: "decreased", productId }),
    remove: (productId) => dispatch({ type: "removed", productId }),
    applyCoupon,
    removeCoupon: () => dispatch({ type: "couponRemoved" }),
  };
}
