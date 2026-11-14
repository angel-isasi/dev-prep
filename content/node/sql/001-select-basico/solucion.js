export function listarProductos(db) {
  // SELECT: qué columnas quiero. FROM: de qué tabla. ORDER BY: en qué orden.
  // Sin ASC ni DESC, ORDER BY ordena de menor a mayor (ASC).
  return db.prepare("SELECT nombre, precio FROM productos ORDER BY precio").all();
}

export function listarClientes(db) {
  // Con texto, ORDER BY ordena alfabéticamente.
  return db.prepare("SELECT nombre, ciudad FROM clientes ORDER BY nombre").all();
}
