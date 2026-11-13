// Aplicación parcial
//
// Fija los primeros argumentos de fn y devuelve una función que espera el resto.
// parcial(fn, a)(b, c) es lo mismo que fn(a, b, c).
//
//   const hola = parcial((saludo, nombre) => `${saludo}, ${nombre}`, "Hola");
//   hola("Angel")  ->  "Hola, Angel"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function parcial(fn, ...fijos) {
  // Tu código aquí
}
