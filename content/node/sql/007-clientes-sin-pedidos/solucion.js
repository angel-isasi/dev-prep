export function clientesSinPedidos(db) {
  // LEFT JOIN conserva TODOS los clientes. Si un cliente no tiene pedidos,
  // las columnas de pedidos (pe.id, pe.fecha...) vienen en NULL.
  // WHERE pe.id IS NULL se queda justo con esos.
  return db
    .prepare(
      `SELECT c.id, c.nombre, c.email
       FROM clientes c
       LEFT JOIN pedidos pe ON pe.cliente_id = c.id
       WHERE pe.id IS NULL
       ORDER BY c.nombre`,
    )
    .all();
}

export function pedidosPorCliente(db) {
  // COUNT(pe.id) cuenta solo los valores que NO son NULL:
  // un cliente sin pedidos tiene una fila con pe.id = NULL, que cuenta 0.
  // COUNT(*) contaría esa fila y daría 1.
  return db
    .prepare(
      `SELECT c.nombre, COUNT(pe.id) AS pedidos
       FROM clientes c
       LEFT JOIN pedidos pe ON pe.cliente_id = c.id
       GROUP BY c.id
       ORDER BY pedidos DESC, c.nombre ASC`,
    )
    .all();
}
