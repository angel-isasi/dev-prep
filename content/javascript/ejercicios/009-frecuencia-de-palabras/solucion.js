export function frecuencia(frase) {
  const conteo = {};
  const palabras = frase.toLowerCase().split(/\s+/).filter(Boolean);

  for (const palabra of palabras) {
    conteo[palabra] = (conteo[palabra] ?? 0) + 1;
  }

  return conteo;
}
