// Sección del carrito: líneas, cupón y resumen.
import { CartLine } from "./CartLine.jsx";
import { CouponForm } from "./CouponForm.jsx";
import { OrderSummary } from "./OrderSummary.jsx";

/** @param {{ cart: ReturnType<typeof import("../hooks/useCart.js").useCart> }} props */
export function Cart({ cart }) {
  const { lines, totals, couponCode } = cart;

  return (
    <section className="cart" aria-labelledby="cart-title">
      <h2 id="cart-title">Tu carrito</h2>

      {lines.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="cart__lines" aria-label="Productos en tu carrito">
            {lines.map((line) => (
              <CartLine
                key={line.product.id}
                line={line}
                onIncrease={() => cart.increase(line.product.id)}
                onDecrease={() => cart.decrease(line.product.id)}
                onRemove={() => cart.remove(line.product.id)}
              />
            ))}
          </ul>
          <CouponForm
            couponCode={couponCode}
            missingForCoupon={totals.missingForCoupon}
            onApply={cart.applyCoupon}
            onRemove={cart.removeCoupon}
          />
          <OrderSummary totals={totals} />
        </>
      )}
    </section>
  );
}
