// Reintentar con espera
//
// Llama a tarea(). Si falla, espera y vuelve a intentar, duplicando la espera
// cada vez (esperaInicial, x2, x4...). Como máximo `intentos` intentos en total.
// Si todos fallan, rechaza con el error del último. Tras el último no esperes.
//
//   await reintentar(() => pagar(pedido), { intentos: 3, esperaInicial: 100 })
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Ya está hecha: una pausa de `ms` milisegundos que se usa con await.
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function reintentar(tarea, { intentos = 3, esperaInicial = 100 } = {}) {
  // Tu código aquí
}
