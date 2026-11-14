// Actualizar y borrar
//
// cambiarPrecio(db, productoId, nuevoPrecio): true si lo cambió, false si no existe.
//   Precio <= 0 o no numérico: Error("El precio debe ser mayor que cero").
// aplicarDescuento(db, categoria, porcentaje): baja los precios de esa categoría
//   (redondeado a 2 decimales) y devuelve cuántos cambió. Porcentaje fuera de 1..99: Error.
// borrarAgotados(db): borra los de stock 0 y devuelve cuántos borró.
//
//   aplicarDescuento(db, "perifericos", 10)  ->  3
//
// .run() devuelve { changes, lastInsertRowid }: changes = filas afectadas.
// ¡Nunca olvides el WHERE en un UPDATE o un DELETE!
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function cambiarPrecio(db, productoId, nuevoPrecio) {
  // Tu código aquí
}

export function aplicarDescuento(db, categoria, porcentaje) {
  // Tu código aquí
}

export function borrarAgotados(db) {
  // Tu código aquí
}
