// Ofertas que llegan a tu correo (alertas de LinkedIn, Glassdoor, Get on Board, Bumeran, Indeed y Computrabajo): LinkedIn y Glassdoor no
// tienen API, pero sí mandan alertas. Un script de Google en tu cuenta (scripts/apps-script-ofertas.gs) lee
// la etiqueta "Ofertas de trabajo" de Gmail y entrega los correos tal cual; aquí se convierten en ofertas
// con la misma forma que las de las bolsas (ver ofertas-auto.js), para puntuarlas y ordenarlas igual.
import { urlSegura } from "./ofertas-auto.js";

/** Remitentes que se leen, y de qué bolsa es cada uno. */
export const REMITENTES = {
  "jobalerts-noreply@linkedin.com": "LinkedIn",
  "noreply@glassdoor.com": "Glassdoor",
  "no-reply@getonbrd.com": "Get on Board",
  "no_reply@bumeran.com": "Bumeran",
  "donotreply@jobalert.indeed.com": "Indeed",
  "trabajos_pe@computrabajo.com": "Computrabajo",
};

export const fuenteDe = (de = "") => {
  const correo = (String(de).match(/<([^>]+)>/)?.[1] ?? String(de)).trim().toLowerCase();
  return REMITENTES[correo] ?? null;
};

const limpiar = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
const esRemoto = (texto) => /remot|desde casa|home office|teletrabajo/i.test(texto);
const conPais = (lugar) => (!lugar || /per[uú]/i.test(lugar) || esRemoto(lugar) ? lugar : `${lugar}, Perú`);

/** Una oferta con la forma de las de las bolsas. */
function oferta({ id, fuente, titulo, empresa, url, lugar, fecha, sueldo = "" }) {
  const ubicacion = conPais(limpiar(lugar));
  return {
    id,
    fuente,
    titulo: limpiar(titulo),
    empresa: limpiar(empresa),
    url,
    remoto: esRemoto(`${titulo} ${lugar}`),
    ubicacion,
    seniority: null,
    salario: sueldo ? { texto: limpiar(sueldo) } : null,
    fecha,
    // Del aviso solo llega esto: el puntaje se basa en el puesto. Para el CV, abre la oferta y pega su texto.
    texto: [limpiar(titulo), limpiar(empresa), ubicacion, sueldo ? `Sueldo: ${limpiar(sueldo)}` : ""].filter(Boolean).join("\n"),
    idioma: /[áéíóúñ]|desarrollador|programador|practicante|analista/i.test(titulo) ? "es" : null,
  };
}

/**
 * LinkedIn (texto plano): bloques separados por "-----", cada uno con puesto, empresa, lugar y
 * "Ver anuncio de empleo: https://www.linkedin.com/comm/jobs/view/ID/...".
 */
// Líneas de un bloque de LinkedIn que no son puesto, empresa ni lugar
const RUIDO_LINKEDIN = [
  /https?:\/\//,
  /personas? estudi(aron|ó|o)/i,
  /^Solicitar con/i,
  /busca personal/i,
  /^\d+ contactos?$/i,
  /^Empleos de/i,
  /^Tu alerta/i,
  /nuevos empleos/i,
  /^Ver todos/i,
  /^Editar alerta/i,
  /^Gestionar/i,
  /^Promocionado/i,
  /^(S\/|US\$|\$|€)|al mes|por mes|\/mes|al año|\/año/i,
];

export function ofertasLinkedin(texto, fecha) {
  const ofertas = [];
  for (const bloque of String(texto).split(/\n-{5,}\n/)) {
    const id = bloque.match(/Ver anuncio de empleo: https:\/\/www\.linkedin\.com\/comm\/jobs\/view\/(\d+)/)?.[1];
    if (!id) continue;
    const antes = bloque.slice(0, bloque.indexOf("Ver anuncio de empleo:"));
    const lineas = antes
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !RUIDO_LINKEDIN.some((re) => re.test(l)));
    if (lineas.length < 3) continue;
    const [titulo, empresa, lugar] = lineas.slice(-3);
    ofertas.push(oferta({ id: `linkedin:${id}`, fuente: "LinkedIn", titulo, empresa, lugar, fecha, url: `https://www.linkedin.com/jobs/view/${id}/` }));
  }
  return ofertas;
}

/** Glassdoor (HTML): cada tarjeta es un enlace a jobListing con empresa, puesto, lugar y antigüedad dentro. */
export function ofertasGlassdoor(html, fecha) {
  const ofertas = [];
  for (const m of String(html).matchAll(/<a\b[^>]*href="([^"]*jobListingId=(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const partes = m[3]
      .replace(/<[^>]+>/g, "\n")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;|&#160;/g, " ")
      .split("\n")
      .map((l) => l.trim())
      // fuera: "Easy Apply", la antigüedad ("5d") y la calificación de la empresa ("3.3 ★")
      .filter((l) => l && !/^easy apply$/i.test(l) && !/^\d+[dh]\+?$/.test(l) && !/^\d([.,]\d)?\s*★?$/.test(l) && l !== "★");
    if (partes.length < 2) continue;
    const [empresa, titulo, lugar = ""] = partes;
    const url = urlSegura(m[1].replace(/&amp;/g, "&"), "https://www.glassdoor.com");
    ofertas.push(oferta({ id: `glassdoor:${m[2]}`, fuente: "Glassdoor", titulo, empresa, lugar, fecha, url }));
  }
  return ofertas;
}

/** Get on Board (texto plano): "- Puesto — Empresa" y en la línea siguiente el enlace. */
export function ofertasGetOnBoard(texto, fecha) {
  const ofertas = [];
  for (const m of String(texto).matchAll(/^- (.+?) — (.+)\n\s+(https:\/\/www\.getonbrd\.com\/jobs\/[^\s?]+\/([^\s?/]+))/gm)) {
    const lugar = /-remote(-[a-z0-9]{4})?$/.test(m[4]) ? "Remoto" : "";
    ofertas.push(oferta({ id: `gob-correo:${m[4]}`, fuente: "Get on Board", titulo: m[1], empresa: m[2], lugar, fecha, url: m[3] }));
  }
  return ofertas;
}

/** Puestos de programación: Bumeran recomienda según el perfil y manda de todo (choferes, ventas...). */
const ES_DE_PROGRAMACION =
  /desarroll|program|software|front|back-?end|full ?-?stack|\bweb\b|javascript|react|node|developer|\bqa\b|devops|sistemas|inform[aá]tic|\bti\b/i;

const slug = (t) =>
  limpiar(t)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Bumeran (texto plano, "Jobi encontró para ti"): cada aviso empieza en "Publicado hace ..." y sigue con
 * puesto, empresa, lugar, jornada y modalidad. Sus enlaces son de rastreo y no vienen en el texto: se
 * enlaza a la búsqueda del puesto en Bumeran. Solo pasan los puestos de programación.
 */
export function ofertasBumeran(texto, fecha) {
  const ofertas = [];
  for (const bloque of String(texto).split(/^\s*Publicado hace[^\n]*$/m).slice(1)) {
    const lineas = bloque
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const fin = lineas.findIndex((l) => /^Postula(rme|ci[oó]n r[aá]pida)$/i.test(l));
    const [titulo, empresa, lugar = "", , modalidad = ""] = fin === -1 ? [] : lineas.slice(0, fin);
    if (!titulo || !empresa || !ES_DE_PROGRAMACION.test(titulo)) continue;
    const id = `bumeran:${slug(`${titulo} ${empresa}`)}`;
    const url = `https://www.bumeran.com.pe/empleos-busqueda-${slug(titulo)}.html`;
    ofertas.push(oferta({ id, fuente: "Bumeran", titulo, empresa, lugar: /remoto/i.test(modalidad) ? `${lugar} (remoto)` : lugar, fecha, url }));
  }
  return ofertas;
}

/**
 * Indeed (texto plano): avisos separados por una línea en blanco; cada uno con puesto, "Empresa - Lugar",
 * a veces sueldo, una descripción corta, la antigüedad y el enlace con su id (jk=). Indeed también manda
 * puestos que no son de programación (RR. HH., comercial): solo pasan los de programación.
 */
export function ofertasIndeed(texto, fecha) {
  const ofertas = [];
  for (const bloque of String(texto).replace(/\r/g, "").split(/\n\s*\n/)) {
    const id = bloque.match(/https:\/\/pe\.indeed\.com\/rc\/clk\/dl\?jk=([a-f0-9]+)/)?.[1];
    if (!id) continue;
    const lineasBloque = bloque.split("\n").map((l) => l.trim()).filter(Boolean);
    const [titulo = "", empresaLugar = ""] = lineasBloque;
    const sueldo = lineasBloque.slice(2, 4).find((l) => /^(S\/|US\$|\$)\s*\.?\s*[\d]/.test(l)) ?? "";
    if (!ES_DE_PROGRAMACION.test(titulo)) continue;
    const corte = empresaLugar.lastIndexOf(" - ");
    const empresa = corte === -1 ? empresaLugar : empresaLugar.slice(0, corte);
    const lugar = corte === -1 ? "" : empresaLugar.slice(corte + 3);
    ofertas.push(oferta({ id: `indeed:${id}`, fuente: "Indeed", titulo, empresa, lugar: lugar.replace(/^remote$/i, "Remoto"), fecha, sueldo, url: `https://pe.indeed.com/viewjob?jk=${id}` }));
  }
  return ofertas;
}

/**
 * Computrabajo (texto plano): cada aviso es un enlace "[| Puesto || 4.2 Empresa || Lugar || Sueldo || Hoy |](...)"
 * cuyo destino real va codificado en "url=". Solo pasan los de programación (las alertas mandan de todo).
 */
export function ofertasComputrabajo(texto, fecha) {
  const ofertas = [];
  for (const m of String(texto).matchAll(/\[([^\]]*)\]\(https:\/\/go\.computrabajo\.com\/go\/app\/o_detail\?url=([^&)]+)/g)) {
    let destino;
    try {
      destino = decodeURIComponent(m[2]).split("?")[0];
    } catch {
      continue;
    }
    const id = destino.match(/-([A-F0-9]{16,})$/)?.[1];
    if (!id || !/^https:\/\/pe\.computrabajo\.com\/ofertas-de-trabajo\//.test(destino)) continue;
    const partes = m[1]
      .split("|")
      .map((p) => p.trim())
      .filter((p) => p && !/^s[ée] el primero/i.test(p));
    const [titulo = "", empresa = "", lugar = ""] = partes;
    if (!ES_DE_PROGRAMACION.test(titulo)) continue;
    ofertas.push(oferta({ id: `computrabajo:${id}`, fuente: "Computrabajo", titulo, empresa: empresa.replace(/^\d([.,]\d)?\s+/, ""), lugar, fecha, url: destino }));
  }
  return ofertas;
}

/**
 * Computrabajo, formato nuevo (desde nov 2026): el puesto entre asteriscos, luego "★ 4.2 Empresa", lugar,
 * sueldo y antigüedad, y al final el enlace de rastreo entre < > con el destino real en "url=".
 */
export function ofertasComputrabajoNuevo(texto, fecha) {
  const ofertas = [];
  const t = String(texto);
  let desde = 0;
  for (const m of t.matchAll(/<https:\/\/go\.computrabajo\.com\/go\/app\/o_detail\?url=([^&>]+)[^>]*>/g)) {
    const antes = t.slice(desde, m.index);
    desde = m.index + m[0].length;
    let destino;
    try {
      destino = decodeURIComponent(m[1]).split("?")[0];
    } catch {
      continue;
    }
    const id = destino.match(/-([A-F0-9]{16,})$/)?.[1];
    if (!id || !/^https:\/\/pe\.computrabajo\.com\/ofertas-de-trabajo\//.test(destino)) continue;
    const lineas = antes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const i = lineas.findLastIndex((l) => /^\*[^*]+\*$/.test(l));
    if (i === -1) continue;
    const titulo = lineas[i].replace(/\*/g, "");
    const empresa = (lineas[i + 1] ?? "").replace(/\[image:[^\]]*\]/g, "").replace(/\*?\d([.,]\d)?\s*\*?/, "").replace(/\*/g, "");
    const lugar = lineas[i + 2] ?? "";
    if (!ES_DE_PROGRAMACION.test(titulo)) continue;
    ofertas.push(oferta({ id: `computrabajo:${id}`, fuente: "Computrabajo", titulo, empresa, lugar, fecha, url: destino }));
  }
  return ofertas;
}

/**
 * Todos los correos que entrega el script de Google, convertidos en ofertas sin repetir (la más nueva
 * gana). @param {{ de: string, fecha: string, texto?: string, html?: string }[]} correos
 */
export function ofertasDeCorreos(correos = []) {
  const porId = new Map();
  const ordenados = [...correos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  for (const original of ordenados) {
    const c = { ...original, texto: original.texto == null ? original.texto : String(original.texto).replace(/\r\n?/g, "\n") };
    const fuente = fuenteDe(c.de);
    const fecha = String(c.fecha ?? "").slice(0, 10) || null;
    const lista =
      fuente === "LinkedIn" ? ofertasLinkedin(c.texto, fecha) : fuente === "Glassdoor" ? ofertasGlassdoor(c.html, fecha) : fuente === "Get on Board" ? ofertasGetOnBoard(c.texto, fecha) : fuente === "Bumeran" ? ofertasBumeran(c.texto, fecha) : fuente === "Indeed" ? ofertasIndeed(c.texto, fecha) : fuente === "Computrabajo" ? [...ofertasComputrabajo(c.texto, fecha), ...ofertasComputrabajoNuevo(c.texto, fecha)] : [];
    for (const o of lista) if (o.titulo) porId.set(o.id, o);
  }
  return [...porId.values()];
}
