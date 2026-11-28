// Postulaciones que ya hiciste, detectadas en los correos de confirmación que te mandan las bolsas y las
// empresas ("Indeed Application: ...", "Te postulaste a ...", "Thank you for applying"). Las entrega el mismo
// script de Google que lee las alertas (scripts/apps-script-ofertas.gs). Así no tienes que registrarlas a mano:
// la app las agrega a tus postulaciones y marca esas ofertas como "Ya postulaste".

const limpiar = (t) => String(t ?? "").replace(/\s+/g, " ").trim();

/** Texto comparable: sin tildes, sin signos ni mayúsculas. */
export const normalizar = (t) =>
  limpiar(t)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** La empresa a partir del remitente cuando el correo no la dice ("careers@sezzle.com" → "Sezzle"). */
function empresaDelRemitente(de) {
  const dominio = String(de).match(/@([a-z0-9-]+)\./i)?.[1] ?? "";
  if (!dominio || /^(gmail|indeed|bumeran|computrabajo|linkedin|glassdoor|greenhouse|lever|workday|airavirtual|getonbrd|myworkday|smartrecruiters)/i.test(dominio)) return "";
  return dominio.replace(/^join/, "").replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Una confirmación de postulación → { puesto, empresa, fuente } (o null si el correo no es una confirmación).
 * @param {{ de: string, asunto: string, texto?: string }} c
 */
export function leerConfirmacion({ de = "", asunto = "", texto = "" }) {
  const a = limpiar(asunto);
  const t = String(texto ?? "").replace(/\r/g, "");
  let m;
  // Indeed: "Indeed Application: Practicante Frontend" (la empresa no viene)
  if ((m = a.match(/^Indeed Application:\s*(.+)$/i))) return { puesto: m[1], empresa: "", fuente: "Indeed" };
  // Bumeran: "Ya recibieron tu postulación" y en el texto "Te postulaste a\n\n  Puesto"
  if (/bumeran/i.test(de) && /tu postulaci[oó]n/i.test(a)) {
    const puesto = t.match(/Te postulaste a\s*\n+\s*([^\n]+)/i)?.[1];
    return puesto ? { puesto: limpiar(puesto), empresa: "", fuente: "Bumeran" } : null;
  }
  // Computrabajo: "Seguimiento de tu postulación para el puesto X" y "en manos de EMPRESA."
  if ((m = a.match(/tu postulaci[oó]n para el puesto\s+(.+)$/i))) {
    const empresa = t.match(/(?:en manos de|por parte de)\s+([^\n|]+?)\.?\s*(?:\||\n|$)/i)?.[1] ?? "";
    return { puesto: m[1], empresa: limpiar(empresa).replace(/\.$/, ""), fuente: "Computrabajo" };
  }
  // Aira y similares: "¡Recibimos tu postulación a PUESTO en EMPRESA!"
  if ((m = a.match(/recibimos tu postulaci[oó]n a\s+(.+?)\s+en\s+(.+?)!?$/i))) return { puesto: m[1], empresa: m[2], fuente: "Correo" };
  // LinkedIn: "Angel, tu solicitud se ha enviado a EMPRESA" (el puesto suele venir en el texto)
  if ((m = a.match(/tu solicitud (?:se ha enviado|fue enviada) a\s+(.+)$/i))) {
    const puesto = t.match(/\n\s*([^\n]{4,90})\n\s*\1?[^\n]*\n?[\s\S]{0,40}?(?:Solicitud enviada|Application sent)/i)?.[1] ?? "";
    return { puesto: limpiar(puesto), empresa: m[1], fuente: "LinkedIn" };
  }
  // Inglés: "Thank you for applying! | Sezzle", "Thanks for applying to Acme", "Your application to Acme"
  if ((m = a.match(/thank(?:s| you) for (?:applying|your application)(?:\s+(?:to|at)\s+([^!|]+))?[!.]?(?:\s*\|\s*(.+))?$/i)) || (m = a.match(/your application (?:to|at)\s+(.+)$/i))) {
    const empresa = limpiar(m[2] ?? m[1] ?? "") || empresaDelRemitente(de);
    // "...interest in the Software Engineer Intern position at Sezzle" / "applying for the X role"
    const puesto = t.match(/\bthe\s+([^,.\n]{4,80}?)\s+(?:position|role)\b/i)?.[1] ?? t.match(/(?:position|role) of\s+([^,.\n]{4,80})/i)?.[1] ?? "";
    return { puesto: limpiar(puesto), empresa, fuente: "Correo" };
  }
  // Español genérico: "tu postulación está activa", "gracias por postular"
  if (/tu postulaci[oó]n (est[aá] activa|fue recibida|fue enviada)|gracias por postular/i.test(a)) {
    return { puesto: "", empresa: empresaDelRemitente(de), fuente: "Correo" };
  }
  return null;
}

/**
 * Todas las confirmaciones, sin repetir (la más vieja manda la fecha).
 * @param {{ de: string, asunto: string, fecha: string, texto?: string }[]} correos
 * @returns {{ id: string, puesto: string, empresa: string, fuente: string, fecha: string|null }[]}
 */
export function postulacionesDeCorreos(correos = []) {
  const porId = new Map();
  const ordenados = [...correos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  for (const c of ordenados) {
    const p = leerConfirmacion(c);
    if (!p || (!p.puesto && !p.empresa)) continue;
    const id = `correo-${normalizar(`${p.puesto} ${p.empresa}`).replace(/ /g, "-").slice(0, 80)}`;
    if (!porId.has(id)) porId.set(id, { id, puesto: limpiar(p.puesto), empresa: limpiar(p.empresa), fuente: p.fuente, fecha: String(c.fecha ?? "").slice(0, 10) || null });
  }
  return [...porId.values()];
}

/** ¿Esta oferta es una a la que ya postulaste? Coincide el puesto y, si se sabe, la empresa. */
export function yaPostulaste(oferta, postulacion) {
  const po = normalizar(postulacion.puesto);
  const pe = normalizar(postulacion.empresa);
  const ot = normalizar(oferta.titulo);
  const oe = normalizar(oferta.empresa);
  const mismaEmpresa = pe && oe && (oe.includes(pe) || pe.includes(oe));
  if (!po) return !!mismaEmpresa && !!pe && oe === pe; // solo la empresa: tiene que ser exactamente la misma
  const mismoPuesto = ot === po || (po.length >= 10 && (ot.includes(po) || po.includes(ot)));
  return mismoPuesto && (!pe || !oe || mismaEmpresa);
}
