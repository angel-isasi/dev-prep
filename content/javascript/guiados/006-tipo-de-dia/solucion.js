export function tipoDeDia(dia) {
  switch (dia.toLowerCase()) {
    case "lunes":
    case "martes":
    case "miércoles":
    case "jueves":
    case "viernes":
      return "laboral";
    case "sábado":
    case "domingo":
      return "fin de semana";
    default:
      return "día inválido";
  }
}
