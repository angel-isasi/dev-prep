// Promedio de notas
//
// Recibe un arreglo de notas (números de 0 a 20) y devuelve su promedio.
// Si no hay notas, devuelve 0.
//
//   promedio([14, 16, 18])  ->  16

export function promedio(notas) {
  if (notas.length === 0) return 0;
  let suma = 0;
  for (let i = 0; i <= notas.length; i++) {
    suma += notas[i];
  }
  return suma / notas.length;
}
