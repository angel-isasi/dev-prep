// Una tupla: un array de largo fijo donde cada posición tiene su tipo.
export type Punto = [number, number];

export function distancia(a: Punto, b: Punto): number {
  // Desestructuración: TypeScript sabe que x1, y1, x2 e y2 son number.
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function puntoMedio(a: Punto, b: Punto): Punto {
  const [x1, y1] = a;
  const [x2, y2] = b;
  // Como el retorno está anotado como Punto, este array se revisa como tupla.
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}
