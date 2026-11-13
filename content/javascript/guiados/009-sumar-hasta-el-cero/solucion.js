export function sumarHastaCero(numeros) {
  let suma = 0;

  for (const numero of numeros) {
    if (numero === 0) break;
    if (numero < 0) continue;
    suma += numero;
  }

  return suma;
}
