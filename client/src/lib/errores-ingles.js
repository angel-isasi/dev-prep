// Tus errores de inglés recientes (de Map, Conversa, el daily y las entrevistas en inglés). Se guardan en
// este navegador: la memoria del tutor (perfil-tutor.js) los usa y "Tus errores de siempre" los agrupa.
const CLAVE = "devprep.inglesErrores";
const MAX = 60;

export function leerErroresIngles() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

/** @param {{ original: string, corregido: string, explicacion?: string }[]} correcciones @param {string} origen */
export function guardarErroresIngles(correcciones, origen = "") {
  const nuevas = (correcciones ?? [])
    .filter((c) => c?.original && c?.corregido)
    .map((c) => ({ original: c.original, corregido: c.corregido, explicacion: c.explicacion ?? "", origen, fecha: new Date().toISOString().slice(0, 10) }));
  if (!nuevas.length) return;
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...leerErroresIngles(), ...nuevas].slice(-MAX)));
  } catch {
    // sin espacio: no pasa nada, es solo una ayuda
  }
}
