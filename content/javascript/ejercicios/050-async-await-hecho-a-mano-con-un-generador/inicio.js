// async/await hecho a mano con un generador
//
// ejecutar(generadorFn) corre un generador que hace yield de promesas,
// le devuelve el resultado de cada una y devuelve una promesa con el valor final.
//
//   await ejecutar(function* () {
//     const a = yield pedir(10);
//     const b = yield pedir(a * 2);
//     return a + b;
//   })  ->  30
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function ejecutar(generadorFn) {
  // Tu código aquí
}
