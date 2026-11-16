// Resumen del pedido.
import { formatPrice } from "../lib/money.js";

/** @param {{ totals: { subtotal: number, discount: number, shipping: number, total: number } }} props */
export function OrderSummary({ totals }) {
  // TODO: un <dl> con <dt>/<dd>: Subtotal, Descuento (solo si es mayor que 0, como "- S/ 11.00"),
  //       Envío ("Gratis" si es 0) y Total.
  void totals;
  void formatPrice;
  return null;
}
