// Utilidades de Markdown sin acceso a disco: las usan el servidor y la versión celular.

/** Saca el texto de una sección "## Título" de un markdown (sin el título). */
export function seccionMarkdown(markdown, titulo) {
  const partes = markdown.split(/^## /m);
  const parte = partes.find((p) => p.startsWith(titulo + "\n") || p.startsWith(titulo + "\r\n"));
  return parte ? parte.slice(parte.indexOf("\n") + 1).trim() : null;
}
