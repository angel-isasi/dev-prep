// Unión discriminada: todas las variantes tienen `tipo`, con un literal distinto.
export type Figura =
  | { tipo: "circulo"; radio: number }
  | { tipo: "rectangulo"; ancho: number; alto: number }
  | { tipo: "triangulo"; base: number; altura: number };

const redondear = (n: number): number => Math.round(n * 100) / 100;

// Área sin redondear: así areaTotal suma valores exactos y redondea una sola vez.
function areaExacta(figura: Figura): number {
  switch (figura.tipo) {
    case "circulo":
      // Aquí figura es { tipo: "circulo"; radio: number }: existe figura.radio.
      return Math.PI * figura.radio * figura.radio;
    case "rectangulo":
      return figura.ancho * figura.alto;
    case "triangulo":
      return (figura.base * figura.altura) / 2;
  }
}

export function area(figura: Figura): number {
  return redondear(areaExacta(figura));
}

export function areaTotal(figuras: Figura[]): number {
  const total = figuras.reduce((suma, figura) => suma + areaExacta(figura), 0);
  return redondear(total);
}
