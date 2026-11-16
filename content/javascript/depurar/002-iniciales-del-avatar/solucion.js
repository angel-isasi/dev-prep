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
      return parte[0].toUpperCase(); // con llaves, la flecha necesita return
    })
    .join("");
}
