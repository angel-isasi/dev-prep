export function productosDeCategoria(db, categoria) {
  // El ? se reemplaza por el valor de `categoria`, de forma segura.
  return db
    .prepare("SELECT id, nombre, precio FROM productos WHERE categoria = ? ORDER BY precio")
    .all(categoria);
}

export function productosEnRango(db, minimo, maximo) {
  // Dos ? se llenan en orden: el primero con `minimo`, el segundo con `maximo`.
  return db
    .prepare("SELECT nombre, precio FROM productos WHERE precio >= ? AND precio <= ? ORDER BY precio")
    .all(minimo, maximo);
}

export function buscarProductos(db, texto) {
  // Los % van en el VALOR, no en el SQL: "%monitor%" significa "contiene monitor".
  return db
    .prepare("SELECT id, nombre FROM productos WHERE nombre LIKE ? ORDER BY nombre")
    .all(`%${texto}%`);
}

export function clientesDeCiudades(db, ciudadA, ciudadB) {
  // OR: basta con que se cumpla una de las dos condiciones.
  return db
    .prepare("SELECT nombre, ciudad FROM clientes WHERE ciudad = ? OR ciudad = ? ORDER BY nombre")
    .all(ciudadA, ciudadB);
}
