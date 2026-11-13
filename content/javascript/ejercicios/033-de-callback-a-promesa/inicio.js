// De callback a promesa
//
// Recibe una función que avisa con un callback (error, dato) como último argumento
// y devuelve una nueva función que hace lo mismo, pero devuelve una promesa.
//
//   const leerAsync = promisificar(leer);
//   await leerAsync("notas.txt")  ->  "contenido de notas.txt"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function promisificar(fn) {
  // Tu código aquí
}
