export function prefijoComun(palabras) {
  if (palabras.length === 0) return "";

  // La primera palabra es el candidato: el prefijo no puede ser más largo que ella.
  let prefijo = palabras[0];

  for (const palabra of palabras.slice(1)) {
    // Recorto el candidato hasta que esta palabra empiece con él.
    while (!palabra.startsWith(prefijo)) {
      prefijo = prefijo.slice(0, -1);
      if (prefijo === "") return "";
    }
  }

  return prefijo;
}
