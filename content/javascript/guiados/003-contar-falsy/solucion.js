export function contarFalsy(valores) {
  let contador = 0;

  for (const valor of valores) {
    if (!valor) contador++;
  }

  return contador;
}
