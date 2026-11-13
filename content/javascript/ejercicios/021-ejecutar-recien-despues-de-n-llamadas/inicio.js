// Ejecutar recién después de N llamadas
//
// Devuelve una función que devuelve undefined en las primeras llamadas
// y recién desde la llamada número `veces` ejecuta fn con los argumentos recibidos.
//
//   const listo = despuesDe(3, () => "listo");
//   [listo(), listo(), listo()]  ->  [undefined, undefined, "listo"]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function despuesDe(veces, fn) {
  // Tu código aquí
}
