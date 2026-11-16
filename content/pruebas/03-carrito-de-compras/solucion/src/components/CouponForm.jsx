// Campo para aplicar un cupón, el cupón aplicado y su botón para quitarlo.
import { useId, useState } from "react";
import { formatPrice } from "../lib/money.js";

/**
 * @param {{
 *   couponCode: string | null,
 *   missingForCoupon: number,
 *   onApply: (code: string) => string,
 *   onRemove: () => void,
 * }} props
 */
export function CouponForm({ couponCode, missingForCoupon, onApply, onRemove }) {
  const inputId = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const message = onApply(code);
    setError(message);
    if (!message) setCode("");
  }

  return (
    <div className="coupon">
      <form className="coupon__form" onSubmit={handleSubmit}>
        <label htmlFor={inputId}>Cupón de descuento</label>
        <div className="coupon__row">
          <input
            id={inputId}
            value={code}
            autoComplete="off"
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
          />
          <button type="submit" disabled={code.trim() === ""}>
            Aplicar
          </button>
        </div>
      </form>

      {error && (
        <p className="coupon__error" role="alert">
          {error}
        </p>
      )}

      {couponCode && (
        <div className="coupon__applied">
          <p>Cupón {couponCode} aplicado</p>
          <button type="button" className="link-button" onClick={onRemove}>
            Quitar cupón
          </button>
        </div>
      )}

      {couponCode && missingForCoupon > 0 && (
        <p className="coupon__note">
          Agrega {formatPrice(missingForCoupon)} más para usar {couponCode}.
        </p>
      )}
    </div>
  );
}
