export function agruparAnagramas(palabras) {
  const grupos = new Map(); // clave (letras ordenadas) -> palabras de ese grupo

  for (const palabra of palabras) {
    // Dos anagramas, con sus letras ordenadas, dan la misma clave.
    const clave = [...palabra].sort().join("");
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(palabra);
  }

  return [...grupos.values()];
}
