// Formatear cualquier valor
//
// 1. Cambia `unknown` por la unión string | number | boolean | null.
// 2. Usa typeof y comparaciones para tratar cada tipo:
//    null -> "Sin dato", boolean -> "Sí"/"No", number -> 2 decimales,
//    string -> sin espacios (si queda vacío, "Sin dato").
//
//   formatearValor(12.5)   ->  "12.50"
//   formatearValor(false)  ->  "No"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export type ValorCelda = unknown;

export function formatearValor(valor: ValorCelda): string {
  // Tu código aquí
  return "";
}
