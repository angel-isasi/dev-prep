// Leer la fecha del formulario
//
// Convierte el texto "DD/MM/AAAA" que escribe el usuario en un objeto Date
// de ese día (a la medianoche, en hora local).
//
//   leerFecha("15/03/2026")  ->  Date del 15 de marzo de 2026

export function leerFecha(texto) {
  const [dia, mes, anio] = texto.split("/").map(Number);
  return new Date(anio, mes, dia);
}
