export function aNumero(texto) {
  const limpio = texto.trim();
  if (limpio === "") return null;

  const numero = Number(limpio);
  if (Number.isNaN(numero)) return null;

  return numero;
}
