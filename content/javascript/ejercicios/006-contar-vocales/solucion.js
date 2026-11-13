export function contarVocales(texto) {
  const vocales = texto.match(/[aeiouáéíóúü]/gi) ?? [];
  return vocales.length;
}
