// Ordenar por precio
//
// Devuelve una lista NUEVA con los productos ordenados de menor a mayor precio.
// El arreglo que recibe (el catálogo en su orden de "Destacados") no debe cambiar.
//
//   ordenarPorPrecio([{ precio: 30 }, { precio: 10 }])  ->  [{ precio: 10 }, { precio: 30 }]

export function ordenarPorPrecio(productos) {
  return productos.sort((a, b) => a.precio - b.precio);
}
