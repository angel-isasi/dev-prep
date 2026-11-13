// Votación de Boyer-Moore: O(n) de tiempo y O(1) de memoria.
export function mayoritario(nums) {
  let candidato = null;
  let votos = 0;

  for (const n of nums) {
    // Si el candidato se quedó sin votos, el número actual toma su lugar.
    if (votos === 0) candidato = n;
    // Igual al candidato suma un voto; distinto, le quita uno.
    votos += n === candidato ? 1 : -1;
  }

  return candidato;
}
