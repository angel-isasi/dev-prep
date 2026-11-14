// number | null: o hay un promedio, o no hay notas para calcularlo.
export function promedio(notas: number[]): number | null {
  if (notas.length === 0) return null;

  // reduce suma sin modificar el array. El 0 inicial hace que `suma` sea number.
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return suma / notas.length;
}
