// La interface describe la forma de un objeto: qué propiedades tiene y de qué tipo.
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

// Una interface puede usar otra: cada ítem lleva un Producto completo.
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export function totalCarrito(items: ItemCarrito[]): number {
  // Dentro del callback, TypeScript sabe que `item` es un ItemCarrito:
  // autocompleta item.producto.precio y avisa si escribes mal un nombre.
  const total = items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
  return Math.round(total * 100) / 100;
}
