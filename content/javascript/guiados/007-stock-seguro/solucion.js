export function stockDe(producto) {
  return producto?.inventario?.stock ?? null;
}
