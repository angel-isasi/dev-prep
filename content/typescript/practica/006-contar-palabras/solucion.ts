// Record<string, number>: claves de texto (desconocidas de antemano) y valores numéricos.
export function contarPalabras(texto: string): Record<string, number> {
  const conteo: Record<string, number> = {};

  const palabras = texto
    .toLowerCase()
    .replace(/[.,;:!?¡¿]/g, "") // quita los signos
    .split(/\s+/) // uno o más espacios o saltos de línea
    .filter((p) => p !== ""); // "  hola" deja un "" al inicio

  for (const palabra of palabras) {
    // Si todavía no está, conteo[palabra] es undefined: `?? 0` lo vuelve 0.
    conteo[palabra] = (conteo[palabra] ?? 0) + 1;
  }

  return conteo;
}

export function masFrecuente(conteo: Record<string, number>): string | null {
  let mejor: string | null = null;
  let maximo = 0;

  // Object.entries da pares [clave, valor] con sus tipos: [string, number].
  for (const [palabra, veces] of Object.entries(conteo)) {
    // `>` y no `>=`: en un empate se queda la primera.
    if (veces > maximo) {
      mejor = palabra;
      maximo = veces;
    }
  }

  return mejor;
}
