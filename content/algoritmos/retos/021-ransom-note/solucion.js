export function puedeEscribir(nota, revista) {
  // Cuántas veces tengo cada letra en la revista.
  const disponibles = {};
  for (const letra of revista) {
    disponibles[letra] = (disponibles[letra] || 0) + 1;
  }

  // Gasto una por cada letra de la nota.
  for (const letra of nota) {
    if (!disponibles[letra]) return false; // no hay (o ya se acabaron)
    disponibles[letra]--;
  }

  return true;
}
