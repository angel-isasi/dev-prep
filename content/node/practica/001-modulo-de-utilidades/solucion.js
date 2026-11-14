// Módulo de Node que viene instalado: el prefijo "node:" lo deja claro.
import { EOL } from "node:os";

export function formatearPrecio(monto) {
  // toFixed(2) redondea y siempre deja dos decimales (devuelve un string).
  return `S/ ${monto.toFixed(2)}`;
}

export function crearSlug(titulo) {
  // trim quita los bordes; /\s+/ corta en uno o más espacios seguidos.
  return titulo.trim().toLowerCase().split(/\s+/).join("-");
}

export function unirLineas(lineas) {
  // EOL es "\r\n" en Windows y "\n" en Linux/Mac.
  return lineas.join(EOL);
}

// Export por defecto: un objeto con las MISMAS funciones (shorthand de objetos).
export default { formatearPrecio, crearSlug, unirLineas };
