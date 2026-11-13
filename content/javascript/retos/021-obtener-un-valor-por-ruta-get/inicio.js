// Obtener un valor por ruta (get)
//
// Lee un valor anidado usando una ruta en texto. Acepta índices con punto
// o con corchetes. Si el camino no existe, devuelve `porDefecto`.
//
//   obtener({ a: { b: [{ c: 5 }] } }, "a.b[0].c")   ->   5
//   obtener({ a: {} }, "a.x.y", "nada")             ->   "nada"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function obtener(obj, ruta, porDefecto) {
  // Tu código aquí
}
