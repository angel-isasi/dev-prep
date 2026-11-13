// sleep y timeout para una promesa
//
//   sleep(ms)              -> promesa que se cumple a los ms milisegundos
//   conTimeout(promesa, ms) -> como la promesa, pero si tarda más de ms se
//                              rechaza con new Error("Tiempo agotado")
//
//   await conTimeout(sleep(5).then(() => "a tiempo"), 50);   // "a tiempo"
//   await conTimeout(sleep(50), 5);                           // Error: Tiempo agotado
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function sleep(ms) {
  // Tu código aquí
}

export function conTimeout(promesa, ms) {
  // Tu código aquí
}
