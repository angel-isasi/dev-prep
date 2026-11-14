export function resumenProductos(db) {
  // Las funciones de agregación convierten las 8 filas en UNA sola fila.
  // AS le pone nombre a cada columna calculada: ese nombre es la propiedad del objeto.
  // .get() devuelve esa única fila como objeto (no un arreglo).
  return db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(stock) AS stockTotal,
              ROUND(AVG(precio), 2) AS precioPromedio
       FROM productos`,
    )
    .get();
}

export function resumenDeCategoria(db, categoria) {
  // Si ninguna fila pasa el WHERE, COUNT da 0 pero SUM y AVG dan NULL.
  // COALESCE(valor, 0) devuelve el primer valor que no sea NULL: aquí, 0.
  return db
    .prepare(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(stock), 0) AS stockTotal,
              COALESCE(ROUND(AVG(precio), 2), 0) AS precioPromedio
       FROM productos
       WHERE categoria = ?`,
    )
    .get(categoria);
}

export function contarPedidosDeCliente(db, clienteId) {
  // .get() da { total: 3 }; la función debe devolver solo el número.
  const fila = db.prepare("SELECT COUNT(*) AS total FROM pedidos WHERE cliente_id = ?").get(clienteId);
  return fila.total;
}
