// Vitest muestra los valores en varias líneas:  "[\n  0,\n  1,\n]".
// Si el valor es corto, lo pasamos a una sola línea:  "[0, 1]".
const LARGO_MAXIMO = 70;

export function compactar(texto) {
  if (typeof texto !== "string") return texto;
  const enUnaLinea = texto
    .replace(/\s*\n\s*/g, " ") // saltos de línea -> un espacio
    .replace(/,\s*([\]}])/g, " $1") // quita la coma final antes de ] o }
    .replace(/\[\s+/g, "[")
    .replace(/\s+\]/g, "]");
  return enUnaLinea.length <= LARGO_MAXIMO ? enUnaLinea : texto;
}
