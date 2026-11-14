export function insertarIntervalo(intervalos, nuevo) {
  const resultado = [];
  let [inicio, fin] = nuevo; // copio los valores: así no modifico `nuevo`
  let i = 0;

  // 1) Los que terminan ANTES de que empiece el nuevo: van tal cual.
  while (i < intervalos.length && intervalos[i][1] < inicio) {
    resultado.push([...intervalos[i]]);
    i++;
  }

  // 2) Los que se superponen con el nuevo: los absorbo, estirando inicio y fin.
  while (i < intervalos.length && intervalos[i][0] <= fin) {
    inicio = Math.min(inicio, intervalos[i][0]);
    fin = Math.max(fin, intervalos[i][1]);
    i++;
  }
  resultado.push([inicio, fin]);

  // 3) Los que empiezan DESPUÉS de que termina el nuevo: van tal cual.
  while (i < intervalos.length) {
    resultado.push([...intervalos[i]]);
    i++;
  }

  return resultado;
}
