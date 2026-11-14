// `tasa: number = 0.18` hace dos cosas: le da un tipo y un valor por defecto.
// Para quien llama, `tasa` es opcional.
export function precioConIgv(precio: number, tasa: number = 0.18): number {
  const total = precio * (1 + tasa);
  // Redondeo a 2 decimales: 59.589999... -> 5958.9999... -> 5959 -> 59.59
  return Math.round(total * 100) / 100;
}
