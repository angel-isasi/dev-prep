// map asíncrono
//
// Como `lista.map(fn)`, pero `fn` es asíncrona. Devuelve una promesa con el
// arreglo de resultados ya resueltos, en orden. Todas las llamadas corren a la vez.
//
//   await mapAsync([1, 2, 3], doblarAsync)  ->  [2, 4, 6]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function mapAsync(lista, fn) {
  // Tu código aquí
}
