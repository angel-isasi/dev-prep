// Suma de los cuadrados de los dígitos: 82 -> 8² + 2² = 68.
function sumaCuadrados(n) {
  let suma = 0;
  while (n > 0) {
    const digito = n % 10; // último dígito
    suma += digito * digito;
    n = Math.floor(n / 10); // quita el último dígito
  }
  return suma;
}

export function esFeliz(n) {
  const vistos = new Set();

  // Paro si llego a 1 (feliz) o si repito un número (ciclo: nunca llegaré).
  while (n !== 1 && !vistos.has(n)) {
    vistos.add(n);
    n = sumaCuadrados(n);
  }

  return n === 1;
}
