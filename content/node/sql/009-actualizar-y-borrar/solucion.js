export function cambiarPrecio(db, productoId, nuevoPrecio) {
  if (typeof nuevoPrecio !== "number" || !(nuevoPrecio > 0)) {
    throw new Error("El precio debe ser mayor que cero");
  }
  // El WHERE limita el cambio a UNA fila: la del id.
  const { changes } = db.prepare("UPDATE productos SET precio = ? WHERE id = ?").run(nuevoPrecio, productoId);
  // changes es 1 si encontró el producto y 0 si no existe.
  return changes > 0;
}

export function aplicarDescuento(db, categoria, porcentaje) {
  if (typeof porcentaje !== "number" || porcentaje < 1 || porcentaje > 99) {
    throw new Error("El porcentaje debe estar entre 1 y 99");
  }
  // El nuevo precio se calcula a partir del precio actual de CADA fila.
  // 100.0 (con decimal) asegura una división con decimales.
  const { changes } = db
    .prepare("UPDATE productos SET precio = ROUND(precio * (100 - ?) / 100.0, 2) WHERE categoria = ?")
    .run(porcentaje, categoria);
  return changes;
}

export function borrarAgotados(db) {
  // Sin el WHERE, este DELETE vaciaría la tabla entera.
  const { changes } = db.prepare("DELETE FROM productos WHERE stock = 0").run();
  return changes;
}
