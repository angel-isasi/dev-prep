export function masCaros(db, n) {
  // DESC: de mayor a menor. Si hay empate en precio, decide el nombre (A-Z).
  // LIMIT ?: corta el resultado en las primeras n filas.
  return db
    .prepare("SELECT nombre, precio FROM productos ORDER BY precio DESC, nombre ASC LIMIT ?")
    .all(n);
}

export function paginaDeProductos(db, pagina, porPagina) {
  // OFFSET: cuántas filas saltar. La página 1 salta 0, la 2 salta porPagina, etc.
  const saltar = (pagina - 1) * porPagina;
  return db
    .prepare("SELECT id, nombre FROM productos ORDER BY id LIMIT ? OFFSET ?")
    .all(porPagina, saltar);
}
