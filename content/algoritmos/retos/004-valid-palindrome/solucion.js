export function esPalindromo(s) {
  // Normalizo: minúsculas y solo letras a-z y dígitos.
  const limpio = s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Dos punteros que avanzan desde los extremos hacia el centro.
  let i = 0;
  let j = limpio.length - 1;
  while (i < j) {
    if (limpio[i] !== limpio[j]) return false;
    i++;
    j--;
  }

  return true;
}
