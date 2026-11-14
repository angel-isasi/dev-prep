export function generarParentesis(n) {
  const resultado = [];
  const camino = []; // los caracteres que llevo elegidos

  function explorar(abiertos, cerrados) {
    // Caso base: ya usé los n "(" y los n ")". Es una combinación completa.
    if (camino.length === 2 * n) {
      resultado.push(camino.join(""));
      return;
    }

    // Opción 1: abrir, si todavía me quedan "(" por usar.
    if (abiertos < n) {
      camino.push("("); // elegir
      explorar(abiertos + 1, cerrados); // explorar
      camino.pop(); // deshacer
    }

    // Opción 2: cerrar, solo si hay algún "(" abierto sin cerrar.
    if (cerrados < abiertos) {
      camino.push(")"); // elegir
      explorar(abiertos, cerrados + 1); // explorar
      camino.pop(); // deshacer
    }
  }

  explorar(0, 0);
  return resultado;
}
