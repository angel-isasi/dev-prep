export function aCamel(texto) {
  // Un grupo de separadores seguido (o no) de un carácter: el carácter va en mayúscula.
  return texto.toLowerCase().replace(/[-_\s]+(.)?/g, (_, letra) => (letra ? letra.toUpperCase() : ""));
}

export function aSlug(texto) {
  return texto
    .normalize("NFD") // separa cada letra de su tilde: "í" -> "i" + "´"
    .replace(/[̀-ͯ]/g, "") // borra las tildes sueltas
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // todo lo que no es letra o número -> un guion
    .replace(/^-+|-+$/g, ""); // sin guiones al inicio ni al final
}
