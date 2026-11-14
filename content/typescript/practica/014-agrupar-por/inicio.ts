// Agrupar por una propiedad
//
// agruparPor(lista, clave): un objeto donde cada clave es un valor de esa
// propiedad (como texto) y cada valor es la lista de elementos que lo tienen.
// Hazla genérica: <T, K extends keyof T>, para que la clave tenga que existir en T.
//
//   agruparPor(productos, "categoria")  ->  { ropa: [...], tecnologia: [...] }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Reemplaza `any` y `string` por los parámetros de tipo <T, K extends keyof T>.
export function agruparPor(lista: any[], clave: string): Record<string, any[]> {
  // Tu código aquí
  return {};
}
