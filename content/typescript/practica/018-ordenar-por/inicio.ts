// Ordenar por cualquier campo
//
// Direccion: "asc" o "desc".
// ordenarPor(lista, campo, direccion = "asc"): copia ordenada por ese campo.
//   Textos con localeCompare; lo demás con < y >.
// valoresDe(lista, campo): los valores de ese campo. Tipo de retorno: T[K][].
// Las dos genéricas: <T, K extends keyof T>.
//
//   ordenarPor(productos, "precio", "desc")  ->  del más caro al más barato
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Reemplaza `string` por una unión de los dos textos posibles.
export type Direccion = string;

// Reemplaza los `any` y el `string` del campo por <T, K extends keyof T>.
export function ordenarPor(lista: any[], campo: string, direccion: Direccion = "asc"): any[] {
  // Tu código aquí
  return lista;
}

export function valoresDe(lista: any[], campo: string): any[] {
  // Tu código aquí
  return [];
}
