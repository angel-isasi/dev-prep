export function maxGanancia(precios) {
  let minimo = Infinity; // el precio más barato visto hasta hoy
  let mejor = 0; // la mejor ganancia encontrada

  for (const precio of precios) {
    minimo = Math.min(minimo, precio);
    // Si vendiera hoy, habiendo comprado al precio más barato anterior:
    mejor = Math.max(mejor, precio - minimo);
  }

  return mejor;
}
