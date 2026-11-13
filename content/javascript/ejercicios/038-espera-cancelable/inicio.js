// Espera cancelable
//
// Devuelve una promesa que se cumple después de `ms` milisegundos, salvo que
// alguien cancele con la señal: entonces se rechaza con new Error("Cancelado").
//
//   const control = new AbortController();
//   const promesa = esperarCancelable(1000, control.signal);
//   control.abort();   // promesa se rechaza con "Cancelado"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function esperarCancelable(ms, signal) {
  // Tu código aquí
}
