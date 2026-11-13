// Polyfill de map, filter y reduce
//
// Escribe tus propias versiones de map, filter y reduce. Dentro de cada
// método, `this` es el arreglo. Recorre con un for.
//
//   [1, 2, 3].miMap((x) => x * 2);             // [2, 4, 6]
//   [1, 2, 3, 4].miFilter((x) => x % 2 === 0); // [2, 4]
//   [1, 2, 3].miReduce((a, b) => a + b);       // 6
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

Array.prototype.miMap = function (callback) {
  // Tu código aquí
};

Array.prototype.miFilter = function (callback) {
  // Tu código aquí
};

Array.prototype.miReduce = function (callback, inicial) {
  // Tu código aquí
};
