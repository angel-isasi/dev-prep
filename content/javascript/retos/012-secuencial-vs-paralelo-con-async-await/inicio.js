// Secuencial vs paralelo con async/await
//
// Una tarea es una función que, al llamarla, arranca un trabajo y devuelve
// una promesa. Escribe:
//   secuencial(tareas) -> una detrás de otra (tiempo total: la suma)
//   paralelo(tareas)   -> todas a la vez (tiempo total: la más lenta)
//
//   const tareas = [() => esperar(30, "a"), () => esperar(30, "b")];
//   await secuencial(tareas);   // ["a", "b"] en ~60 ms
//   await paralelo(tareas);     // ["a", "b"] en ~30 ms
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export async function secuencial(tareas) {
  // Tu código aquí
}

export async function paralelo(tareas) {
  // Tu código aquí
}
