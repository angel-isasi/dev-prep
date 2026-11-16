// Iniciales para el avatar
//
// Recibe el nombre completo de un usuario y devuelve sus iniciales en mayúscula.
// Ignora los espacios de más.
//
//   iniciales("Ana Torres")  ->  "AT"

export function iniciales(nombreCompleto) {
  return nombreCompleto
    .trim()
    .split(" ")
    .filter((parte) => parte !== "")
    .map((parte) => {
      parte[0].toUpperCase();
    })
    .join("");
}
