// Una línea del carrito: producto, cantidad con botones y total de la línea.

/**
 * @param {{
 *   line: { product: { id: number, name: string, price: number }, quantity: number, lineTotal: number },
 *   onIncrease: () => void,
 *   onDecrease: () => void,
 *   onRemove: () => void,
 * }} props
 */
export function CartLine(props) {
  // TODO: un <li> con el nombre, el precio unitario y:
  //       <button aria-label="Disminuir cantidad de <nombre>">−</button>   (deshabilitado en 1)
  //       <output aria-label="Cantidad de <nombre>">{quantity}</output>
  //       <button aria-label="Aumentar cantidad de <nombre>">+</button>    (deshabilitado en MAX_QUANTITY)
  //       el total de la línea y <button aria-label="Quitar <nombre>">Quitar</button>
  void props;
  return null;
}
