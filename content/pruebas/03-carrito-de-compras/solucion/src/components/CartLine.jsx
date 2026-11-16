// Una línea del carrito: producto, cantidad con botones y total de la línea.
import { MAX_QUANTITY } from "../lib/cart.js";
import { formatPrice } from "../lib/money.js";

/**
 * @param {{
 *   line: { product: { id: number, name: string, price: number }, quantity: number, lineTotal: number },
 *   onIncrease: () => void,
 *   onDecrease: () => void,
 *   onRemove: () => void,
 * }} props
 */
export function CartLine({ line, onIncrease, onDecrease, onRemove }) {
  const { product, quantity, lineTotal } = line;

  return (
    <li className="cart-line">
      <div className="cart-line__info">
        <span className="cart-line__name">{product.name}</span>
        <span className="cart-line__unit">{formatPrice(product.price)} c/u</span>
      </div>

      {/* Los botones dicen el producto: "+" solo no le dice nada a un lector de pantalla. */}
      <div className="cart-line__quantity">
        <button
          type="button"
          aria-label={`Disminuir cantidad de ${product.name}`}
          disabled={quantity <= 1}
          onClick={onDecrease}
        >
          −
        </button>
        <output aria-label={`Cantidad de ${product.name}`}>{quantity}</output>
        <button
          type="button"
          aria-label={`Aumentar cantidad de ${product.name}`}
          disabled={quantity >= MAX_QUANTITY}
          onClick={onIncrease}
        >
          +
        </button>
      </div>

      <span className="cart-line__total">{formatPrice(lineTotal)}</span>
      <button type="button" className="link-button" aria-label={`Quitar ${product.name}`} onClick={onRemove}>
        Quitar
      </button>
    </li>
  );
}
