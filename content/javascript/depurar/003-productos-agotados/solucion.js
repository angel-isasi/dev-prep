// Contar productos agotados
//
// Recibe el stock de cada producto tal como llega de la hoja de cálculo:
// un número, o "" si la celda está vacía (el stock aún no se registró).
// Devuelve cuántos productos tienen stock exactamente 0.
//
//   contarAgotados([5, 0, "", 12, 0])  ->  2

export function contarAgotados(stocks) {
  let agotados = 0;
  for (const stock of stocks) {
    if (stock === 0) agotados++; // === no convierte tipos: "" ya no cuenta como 0
  }
  return agotados;
}
