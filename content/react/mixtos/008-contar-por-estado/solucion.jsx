export function contarPorEstado(pedidos) {
  return pedidos.reduce((conteo, pedido) => {
    // Si el estado aún no está, empieza en 0 y suma 1.
    conteo[pedido.estado] = (conteo[pedido.estado] ?? 0) + 1;
    return conteo;
  }, {});
}

export function ResumenEstados({ pedidos }) {
  if (pedidos.length === 0) return <p>Sin pedidos</p>;

  const conteo = contarPorEstado(pedidos);
  const texto = Object.entries(conteo)
    .map(([estado, cantidad]) => `${cantidad} ${estado}`)
    .join(", ");

  return <p>{texto}</p>;
}
