export function intervalosAQuitar(intervalos) {
  // Ordeno una copia por FIN: conservar primero el que termina antes
  // deja la mayor cantidad de espacio libre para los siguientes.
  const ordenados = [...intervalos].sort((a, b) => a[1] - b[1]);

  let quitados = 0;
  let finUltimo = -Infinity; // fin del último intervalo que decidí conservar

  for (const [inicio, fin] of ordenados) {
    if (inicio >= finUltimo) {
      // No choca con el último conservado (tocarse está permitido): lo conservo.
      finUltimo = fin;
    } else {
      // Choca: lo quito. Como está ordenado por fin, este termina igual o más tarde
      // que el que ya conservé, así que es el que más estorba.
      quitados++;
    }
  }

  return quitados;
}
