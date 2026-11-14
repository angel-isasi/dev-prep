export function combinacionesQueSuman(candidatos, objetivo) {
  // Ordeno una copia de menor a mayor: así puedo cortar en cuanto uno se pasa.
  const ordenados = [...candidatos].sort((a, b) => a - b);
  const resultado = [];
  const camino = []; // la combinación que estoy armando

  // `desde`: solo puedo elegir candidatos a partir de este índice (evita repetidos).
  // `restante`: cuánto me falta para llegar al objetivo.
  function explorar(desde, restante) {
    if (restante === 0) {
      resultado.push([...camino]); // llegué justo: guardo una COPIA
      return;
    }

    for (let i = desde; i < ordenados.length; i++) {
      const candidato = ordenados[i];
      // Si este ya se pasa, los siguientes (más grandes) también: corto aquí.
      if (candidato > restante) break;

      camino.push(candidato); // elegir
      explorar(i, restante - candidato); // explorar (con `i`, no `i + 1`: puedo repetirlo)
      camino.pop(); // deshacer
    }
  }

  explorar(0, objetivo);
  return resultado;
}
