// Lista de productos ya filtrados y ordenados.
import { formatPrice } from "../lib/catalog.js";

/** @param {{ products: Array<{ id: number, name: string, category: string, price: number }> }} props */
export function ProductList({ products }) {
  return (
    <ul className="product-grid" aria-label="Productos">
      {products.map((product) => (
        <li key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p className="product-card__category">{product.category}</p>
          <p className="product-card__price">{formatPrice(product.price)}</p>
        </li>
      ))}
    </ul>
  );
}
