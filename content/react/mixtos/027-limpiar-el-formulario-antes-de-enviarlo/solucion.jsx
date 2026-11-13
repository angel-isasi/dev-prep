// Limpia lo que escribió el usuario. Devuelve un objeto nuevo: no toca el original.
export function normalizarPedido(formulario) {
  return {
    // "  Angel   Isasi " -> "Angel Isasi"
    nombre: formulario.nombre.trim().replace(/\s+/g, " "),
    // " ANGEL@Unica.edu.pe " -> "angel@unica.edu.pe"
    correo: formulario.correo.trim().toLowerCase(),
    // "+51 987-654-321" -> "51987654321"
    telefono: formulario.telefono.replace(/\D/g, ""),
    // "abc" -> NaN -> 1 ; "0" -> 0 -> 1 ; "3" -> 3
    cantidad: Math.max(1, Number.parseInt(formulario.cantidad, 10) || 1),
  };
}
