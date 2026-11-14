// Tareas en paralelo
//
// Cada tarea es una función que devuelve una promesa. Arráncalas TODAS a la vez
// y espera el conjunto: Promise.all en cargarTodo y Promise.allSettled en
// cargarLoQueSePueda.
//
//   await cargarTodo([() => usuario(), () => pedidos()])  ->  [usuario, pedidos]
//   await cargarLoQueSePueda([ok, falla])                 ->  { exitos: [...], fallos: ["mensaje"] }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export async function cargarTodo(tareas) {
  // Tu código aquí
}

export async function cargarLoQueSePueda(tareas) {
  // Tu código aquí
}
