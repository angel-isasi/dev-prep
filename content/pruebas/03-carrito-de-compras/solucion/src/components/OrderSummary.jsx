// Resumen del pedido.
import { formatPrice } from "../lib/money.js";

/** @param {{ totals: { subtotal: number, discount: number, shipping: number, total: number } }} props */
export function OrderSummary({ totals }) {
  return (
    <dl className="summary">
      <dt>Subtotal</dt>
      <dd>{formatPrice(totals.subtotal)}</dd>

      {totals.discount > 0 && (
        <>
          <dt>Descuento</dt>
          <dd className="summary__discount">- {formatPrice(totals.discount)}</dd>
        </>
      )}

      <dt>Envío</dt>
      <dd>{totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping)}</dd>

      <dt className="summary__total">Total</dt>
      <dd className="summary__total">{formatPrice(totals.total)}</dd>
    </dl>
  );
}
