// Componer funciones (pipe y compose)
//
//   pipe(f, g, h)(x)    -> h(g(f(x)))   (de izquierda a derecha)
//   compose(f, g, h)(x) -> f(g(h(x)))   (de derecha a izquierda)
//
//   pipe((n) => n + 1, (n) => n * 2)(5)      // 12
//   compose((n) => n + 1, (n) => n * 2)(5)   // 11
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function pipe(...fns) {
  // Tu código aquí
}

export function compose(...fns) {
  // Tu código aquí
}
