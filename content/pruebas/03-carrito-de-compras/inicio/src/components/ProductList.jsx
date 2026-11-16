// Catálogo: cada producto con su botón para agregarlo al carrito.
import { formatPrice } from "../lib/money.js";

/**
 * @param {{
 *   products: Array<{ id: number, name: string, description: string, price: number }>,
 *   quantityOf: (productId: number) => number,   cuántas unidades hay ya en el carrito
 *   onAdd: (productId: number) => void,
 * }} props
 */
export function ProductList({ products, quantityOf, onAdd }) {
  // TODO: <ul aria-label="Productos"> con un <li> por producto: <h3> con el nombre,
  //       la descripción, el precio con formatPrice() y el botón "Agregar al carrito"
  //       (deshabilitado si ya hay MAX_QUANTITY unidades en el carrito).
  void products;
  void quantityOf;
  void onAdd;
  void formatPrice;
  return null;
}
