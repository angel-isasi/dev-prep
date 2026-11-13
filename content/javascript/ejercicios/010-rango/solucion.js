export function rango(inicio, fin, paso = 1) {
  const resultado = [];
  for (let i = inicio; i <= fin; i += paso) {
    resultado.push(i);
  }
  return resultado;
}
