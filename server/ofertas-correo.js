// Ofertas que llegan a tu correo (alertas de LinkedIn, Glassdoor y Get on Board): LinkedIn y Glassdoor no
// tienen API, pero sí mandan alertas. Un script de Google en tu cuenta (scripts/apps-script-ofertas.gs) lee
// la etiqueta "Ofertas de trabajo" de Gmail y entrega los correos tal cual; aquí se convierten en ofertas
// con la misma forma que las de las bolsas (ver ofertas-auto.js), para puntuarlas y ordenarlas igual.
import { urlSegura } from "./ofertas-auto.js";

/** Remitentes que se leen, y de qué bolsa es cada uno. */
export const REMITENTES = {
  "jobalerts-noreply@linkedin.com": "LinkedIn",
  "noreply@glassdoor.com": "Glassdoor",
  "no-reply@getonbrd.com": "Get on Board",
};

export const fuenteDe = (de = "") => {
  const correo = (String(de).match(/<([^>]+)>/)?.[1] ?? String(de)).trim().toLowerCase();
  return REMITENTES[correo] ?? null;
};

const limpiar = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
const esRemoto = (texto) => /remot|desde casa|home office|teletrabajo/i.test(texto);
const conPais = (lugar) => (!lugar || /per[uú]/i.test(lugar) || esRemoto(lugar) ? lugar : `${lugar}, Perú`);

/** Una oferta con la forma de las de las bolsas. */
function oferta({ id, fuente, titulo, empresa, url, lugar, fecha }) {
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
    salario: null,
    fecha,
    // Del aviso solo llega esto: el puntaje se basa en el puesto. Para el CV, abre la oferta y pega su texto.
    texto: [limpiar(titulo), limpiar(empresa), ubicacion].filter(Boolean).join("\n"),
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
  /personas? estudiaron/i,
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

/**
 * Todos los correos que entrega el script de Google, convertidos en ofertas sin repetir (la más nueva
 * gana). @param {{ de: string, fecha: string, texto?: string, html?: string }[]} correos
 */
export function ofertasDeCorreos(correos = []) {
  const porId = new Map();
  const ordenados = [...correos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  for (const c of ordenados) {
    const fuente = fuenteDe(c.de);
    const fecha = String(c.fecha ?? "").slice(0, 10) || null;
    const lista =
      fuente === "LinkedIn" ? ofertasLinkedin(c.texto, fecha) : fuente === "Glassdoor" ? ofertasGlassdoor(c.html, fecha) : fuente === "Get on Board" ? ofertasGetOnBoard(c.texto, fecha) : [];
    for (const o of lista) if (o.titulo) porId.set(o.id, o);
  }
  return [...porId.values()];
}
