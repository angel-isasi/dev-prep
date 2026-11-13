const TASA_IGV = 0.18;

// 118 -> "S/ 118.00"
export function soles(monto) {
  return `S/ ${monto.toFixed(2)}`;
}

export function ResumenPedido({ items }) {
  // Valor inicial 0: con el carrito vacío el subtotal es 0, no un error.
  const subtotal = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const igv = subtotal * TASA_IGV;
  const total = subtotal + igv;

  return (
    <dl>
      <dt>Subtotal</dt>
      <dd>{soles(subtotal)}</dd>
      <dt>IGV (18%)</dt>
      <dd>{soles(igv)}</dd>
      <dt>Total</dt>
      <dd>{soles(total)}</dd>
    </dl>
  );
}
