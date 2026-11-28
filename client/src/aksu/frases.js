// Cómo se dice en voz alta lo que Aksu va escribiendo: sin código ni marcas, frase por frase.
// Archivo puro (sin navegador) para poder probarlo.

/** Lo que se dice en voz alta: sin bloques de código ni marcas de Markdown. */
export function paraVoz(todo) {
  let t = String(todo ?? "").replace(/```[\s\S]*?```/g, " ");
  const abierto = t.indexOf("```");
  if (abierto >= 0) t = t.slice(0, abierto); // un bloque que todavía no se cierra no se lee
  return t.replace(/[`*_#>]/g, "");
}

/**
 * Corta el texto nuevo en frases completas listas para decir; lo que queda a medias espera al
 * siguiente trozo. Con final = true se dice todo lo que quede.
 * @returns {{ frases: string[], usado: number }}  usado: cuántos caracteres se consumieron
 */
export function frasesListas(nuevo, final = false) {
  let corte = final ? nuevo.length : -1;
  if (!final) {
    const re = /[.!?…:;](?=\s)|\n/g;
    for (let m = re.exec(nuevo); m; m = re.exec(nuevo)) corte = m.index + m[0].length;
  }
  if (corte <= 0) return { frases: [], usado: 0 };
  const frases = nuevo
    .slice(0, corte)
    .split(/(?<=[.!?…:;])\s+|\n+/)
    .map((f) => f.trim())
    .filter((f) => /[a-záéíóúñ0-9]/i.test(f));
  return { frases, usado: corte };
}
