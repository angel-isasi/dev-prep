// Las tres tablas tienen columnas llamadas `id` y `nombre`, así que cada
// columna se escribe con el alias de su tabla: pe = pedidos, c = clientes, pr = productos.
const CONSULTA_BASE = `
  SELECT pe.id,
         pe.fecha,
         c.nombre AS cliente,
         pr.nombre AS producto,
         pe.cantidad,
         pe.cantidad * pr.precio AS total
  FROM pedidos pe
  JOIN clientes c ON c.id = pe.cliente_id
  JOIN productos pr ON pr.id = pe.producto_id
`;

export function pedidosConCliente(db) {
  return db.prepare(`${CONSULTA_BASE} ORDER BY pe.id`).all();
}

export function pedidosDeCiudad(db, ciudad) {
  // La plantilla solo junta texto FIJO escrito por ti; el valor del usuario va en el ?.
  return db.prepare(`${CONSULTA_BASE} WHERE c.ciudad = ? ORDER BY pe.id`).all(ciudad);
}
