// Catálogo: cada producto con su botón para agregarlo al carrito.
import { MAX_QUANTITY } from "../lib/cart.js";
import { formatPrice } from "../lib/money.js";

/**
 * @param {{
 *   products: Array<{ id: number, name: string, description: string, price: number }>,
 *   quantityOf: (productId: number) => number,
 *   onAdd: (productId: number) => void,
 * }} props
 */
export function ProductList({ products, quantityOf, onAdd }) {
  return (
    <ul className="products" aria-label="Productos">
      {products.map((product) => {
        const isMaxed = quantityOf(product.id) >= MAX_QUANTITY;
        return (
          <li key={product.id} className="product">
            <h3>{product.name}</h3>
            <p className="product__description">{product.description}</p>
            <p className="product__price">{formatPrice(product.price)}</p>
            <button type="button" disabled={isMaxed} onClick={() => onAdd(product.id)}>
              Agregar al carrito
            </button>
            {isMaxed && <p className="product__note">Máximo {MAX_QUANTITY} unidades por pedido.</p>}
          </li>
        );
      })}
    </ul>
  );
}
