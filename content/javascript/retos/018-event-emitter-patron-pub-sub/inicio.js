// Event emitter (patrón pub/sub)
//
// Clase con tres métodos:
//   on(evento, fn)        -> suscribe fn y devuelve una función para desuscribirse
//   off(evento, fn)       -> quita fn de ese evento
//   emit(evento, ...args) -> llama a todas las suscritas con los argumentos
//
//   const e = new Emisor();
//   const quitar = e.on("voto", (x) => console.log(x));
//   e.emit("voto", "Drama");   // imprime Drama
//   quitar();
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export class Emisor {
  // Tu código aquí
}
