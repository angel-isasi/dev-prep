// Hook del carrito: estado con useReducer, persistencia y acciones listas para usar.

export function useCart() {
  // TODO: useReducer(cartReducer, ..., loadCart) para leer localStorage UNA sola vez al iniciar.
  // TODO: guarda con saveCart() cada vez que cambie el estado (useEffect).
  // TODO: calcula lines y totals con getCartLines() y getTotals().
  // TODO: applyCoupon(code) usa checkCoupon(): si hay error lo devuelve (string),
  //       si no, despacha la acción y devuelve "".
  return {
    lines: [],
    totals: { subtotal: 0, discount: 0, shipping: 0, total: 0, missingForCoupon: 0 },
    couponCode: null,
    quantityOf: () => 0,
    add: () => {},
    increase: () => {},
    decrease: () => {},
    remove: () => {},
    applyCoupon: () => "",
    removeCoupon: () => {},
  };
}
