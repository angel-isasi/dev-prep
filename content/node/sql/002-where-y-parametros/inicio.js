// Filtrar con WHERE
//
// Cuatro consultas con WHERE. Los valores van SIEMPRE como parámetros `?`:
//   db.prepare("SELECT ... FROM tabla WHERE columna = ?").all(valor)
//
//   productosDeCategoria(db, "audio")
//     ->  [{ id: 6, nombre: "Parlante bluetooth", precio: 99 }, { id: 5, ... }]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function productosDeCategoria(db, categoria) {
  // Tu código aquí
}

export function productosEnRango(db, minimo, maximo) {
  // Tu código aquí
}

export function buscarProductos(db, texto) {
  // Tu código aquí
}

export function clientesDeCiudades(db, ciudadA, ciudadB) {
  // Tu código aquí
}
