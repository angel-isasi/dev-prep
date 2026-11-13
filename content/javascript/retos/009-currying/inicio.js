// Currying
//
// Devuelve una versión de `fn` que acepta los argumentos de a uno, de a
// varios o todos juntos, y se ejecuta cuando ya tiene fn.length argumentos.
//
//   const sumar3 = curry((a, b, c) => a + b + c);
//   sumar3(1)(2)(3);   // 6
//   sumar3(1, 2)(3);   // 6
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function curry(fn) {
  // Tu código aquí
}
