// retry con espera
//
// Llama a `fn` y, si falla, reintenta hasta `intentos` veces. Entre intento
// e intento espera esperaMs, luego esperaMs * 2, luego esperaMs * 4...
// Si se acaban los intentos, se rechaza con el último error.
//
//   await reintentar(inestable, 3, 1);   // "ok" si alguno de los 3 sale bien
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export async function reintentar(fn, intentos = 3, esperaMs = 10) {
  // Tu código aquí
}
