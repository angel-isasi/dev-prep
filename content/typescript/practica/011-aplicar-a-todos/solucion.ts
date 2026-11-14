// Un tipo de función: describe qué recibe y qué devuelve, sin decir cómo lo hace.
export type Transformacion = (precio: number) => number;

// `transformar` es un parámetro como cualquier otro, solo que su tipo es una función.
export function aplicarATodos(precios: number[], transformar: Transformacion): number[] {
  // map crea un arreglo nuevo: el original no se toca.
  return precios.map((precio) => transformar(precio));
}

// Una función que DEVUELVE otra función (una "fábrica" de transformaciones).
// La función de adentro recuerda `porcentaje` gracias al closure.
export function conDescuento(porcentaje: number): Transformacion {
  return (precio) => precio - (precio * porcentaje) / 100;
}
