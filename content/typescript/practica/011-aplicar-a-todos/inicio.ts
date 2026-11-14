// Aplicar una función a todos
//
// 1. Escribe el tipo Transformacion: una función que recibe un precio (number)
//    y devuelve un number.
// 2. aplicarATodos(precios, transformar): devuelve un arreglo NUEVO con la
//    transformación aplicada a cada precio.
// 3. conDescuento(porcentaje): devuelve una Transformacion que quita ese porcentaje.
//
//   aplicarATodos([100, 50], conDescuento(20))  ->  [80, 40]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Reemplaza `any` por el tipo de función correcto.
export type Transformacion = any;

export function aplicarATodos(precios: number[], transformar: Transformacion): number[] {
  // Tu código aquí
  return [];
}

export function conDescuento(porcentaje: number): Transformacion {
  // Tu código aquí
}
