export function esAnagrama(a, b) {
  // Si los largos no coinciden, ya sé la respuesta.
  if (a.length !== b.length) return false;

  // Cuento cuántas veces aparece cada letra de `a`.
  const conteo = {};
  for (const letra of a) {
    conteo[letra] = (conteo[letra] || 0) + 1;
  }

  // Gasto las letras con `b`. Si alguna no alcanza, no son anagramas.
  for (const letra of b) {
    if (!conteo[letra]) return false;
    conteo[letra]--;
  }

  return true;
}
