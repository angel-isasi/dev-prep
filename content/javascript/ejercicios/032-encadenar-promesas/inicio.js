// Encadenar promesas
//
// `sumarLento(a, b)` ya está hecha: devuelve una promesa con a + b después de 10 ms.
// Escribe `sumarTres(a, b, c)` usando dos llamadas a `sumarLento`.
//
//   await sumarTres(1, 2, 3)  ->  6
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Ya está hecha, no la cambies.
export function sumarLento(a, b) {
  return new Promise((resolver) => setTimeout(() => resolver(a + b), 10));
}

export async function sumarTres(a, b, c) {
  // Tu código aquí
}
