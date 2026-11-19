// ¿Estás en medio de algo que una recarga cortaría? Lo usa AvisoPWA para decidir si aplica ya
// la versión nueva de la app o espera a que salgas de esa pantalla.

/** @param {{ pathname: string, search?: string }} ubicacion */
export function estaOcupado({ pathname, search = "" }) {
  if (pathname === "/leccion" || pathname === "/enfoque") return true;
  if (/^\/practicar\/[^/]+$/.test(pathname) && pathname !== "/practicar/lista") return true; // un ejercicio abierto
  if (/^\/ingles\/(historia|roleplay|unidad)\/[^/]+$/.test(pathname)) return true;
  if (pathname === "/ingles/parejas" || pathname === "/ingles/examen" || pathname === "/ingles/conversa") return true;
  if (/^\/revision\/[^/]+$/.test(pathname)) return true;
  const pestana = new URLSearchParams(search).get("pestana");
  return pathname === "/entrevistas" && ["simulacro", "voz", "tarjetas"].includes(pestana);
}
