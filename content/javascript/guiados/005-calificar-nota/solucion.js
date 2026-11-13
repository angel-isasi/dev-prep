export function calificar(nota) {
  if (nota < 0 || nota > 20) return "nota inválida";
  if (nota < 11) return "desaprobado";
  if (nota < 14) return "aprobado";
  if (nota < 18) return "bueno";
  return "excelente";
}
