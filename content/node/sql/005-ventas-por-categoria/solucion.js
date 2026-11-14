export function ventasPorCategoria(db) {
  // GROUP BY junta las filas que tienen la misma categoría;
  // COUNT y SUM se calculan dentro de cada grupo.
  return db
    .prepare(
      `SELECT categoria, COUNT(*) AS ventas, SUM(monto) AS total
       FROM ventas
       GROUP BY categoria
       ORDER BY total DESC`,
    )
    .all();
}

export function categoriasQueSuperan(db, minimo) {
  // HAVING filtra GRUPOS, después de calcular SUM. WHERE no puede usar SUM.
  return db
    .prepare(
      `SELECT categoria, SUM(monto) AS total
       FROM ventas
       GROUP BY categoria
       HAVING SUM(monto) >= ?
       ORDER BY total DESC`,
    )
    .all(minimo);
}

export function ventasDesde(db, fecha) {
  // WHERE filtra FILAS antes de agrupar: solo entran las ventas desde esa fecha.
  return db
    .prepare(
      `SELECT categoria, COUNT(*) AS ventas, SUM(monto) AS total
       FROM ventas
       WHERE fecha >= ?
       GROUP BY categoria
       ORDER BY total DESC`,
    )
    .all(fecha);
}
