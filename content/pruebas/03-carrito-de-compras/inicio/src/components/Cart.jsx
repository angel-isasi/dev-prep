// Sección del carrito: líneas, cupón y resumen.
import { CartLine } from "./CartLine.jsx";
import { CouponForm } from "./CouponForm.jsx";
import { OrderSummary } from "./OrderSummary.jsx";

/** @param {{ cart: ReturnType<typeof import("../hooks/useCart.js").useCart> }} props */
export function Cart({ cart }) {
  // TODO: <section aria-labelledby="..."> con el título <h2>Tu carrito</h2>.
  // TODO: si no hay líneas: "Tu carrito está vacío."
  // TODO: si hay: <ul aria-label="Productos en tu carrito"> con un <CartLine /> por línea,
  //       luego <CouponForm /> y <OrderSummary />.
  void cart;
  void CartLine;
  void CouponForm;
  void OrderSummary;
  return null;
}
