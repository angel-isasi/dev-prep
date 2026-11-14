// Área de figuras
//
// Figura es una unión discriminada por `tipo`. Usa un switch sobre figura.tipo
// y calcula el área de cada forma (redondeada a 2 decimales).
// areaTotal suma las áreas de un array de figuras.
//
//   area({ tipo: "rectangulo", ancho: 4, alto: 2.5 })  ->  10
//   area({ tipo: "circulo", radio: 1 })                ->  3.14
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export type Figura =
  | { tipo: "circulo"; radio: number }
  | { tipo: "rectangulo"; ancho: number; alto: number }
  | { tipo: "triangulo"; base: number; altura: number };

export function area(figura: Figura): number {
  // Tu código aquí
  return 0;
}

export function areaTotal(figuras: Figura[]): number {
  // Tu código aquí
  return 0;
}
