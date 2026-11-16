// Postulaciones: seguimiento a los 7 días, tus números, la meta semanal y las plantillas de mensaje.
// Funciones puras: las usan la web (pestaña Postulaciones) y la Lambda (aviso de seguimiento).
//
// Una postulación es un registro { empresa, puesto, enlace, fuente, etapa, fecha, enviadaEl,
// seguimientoEl, seguimientos }. "enviadaEl" es el día en que pasó de "Por postular" a otra etapa.
import { lunesDe } from "./metricas.js";
import { sumarDias } from "./progreso-reglas.js";

export const ETAPAS = [
  ["por-postular", "Por postular"],
  ["enviada", "Enviada"],
  ["prueba", "Prueba técnica"],
  ["entrevista", "Entrevista"],
  ["oferta", "Oferta"],
  ["rechazo", "No siguió"],
  ["sin-respuesta", "Sin respuesta"],
];

/** Etapas que significan que la empresa te respondió (un "no" también es respuesta). */
const RESPONDIERON = new Set(["prueba", "entrevista", "oferta", "rechazo"]);

/** Días que pasan para pedir un seguimiento. */
export const DIAS_SEGUIMIENTO = 7;

const aUtc = (fecha) => {
  const [a, m, d] = String(fecha).slice(0, 10).split("-").map(Number);
  return Date.UTC(a, m - 1, d);
};
/** Días de `desde` a `hasta` (fechas "AAAA-MM-DD"). */
export const diasEntre = (desde, hasta) => Math.round((aUtc(hasta) - aUtc(desde)) / 86_400_000);

/** El día en que la enviaste (las antiguas, sin "enviadaEl", usan su fecha de creación). */
export function fechaDeEnvio(p) {
  if (p.enviadaEl) return p.enviadaEl;
  return p.etapa && p.etapa !== "por-postular" && p.fecha ? p.fecha : null;
}

/**
 * Al guardar: si la postulación sale de "Por postular", anota el día en que la enviaste.
 * @param {object} p      la postulación que vas a guardar
 * @param {string} hoy
 */
export function conFechaDeEnvio(p, hoy) {
  if (p.enviadaEl || !p.etapa || p.etapa === "por-postular") return p;
  return { ...p, enviadaEl: hoy };
}

/**
 * Las que enviaste hace 7 días o más y siguen sin respuesta (contando desde tu último seguimiento).
 * @returns {object[]}  cada una con `dias` (desde el envío o el último seguimiento), de la más antigua a la más nueva
 */
export function seguimientosPendientes(lista, hoy) {
  return lista
    .filter((p) => p.etapa === "enviada")
    .map((p) => {
      const desde = p.seguimientoEl ?? fechaDeEnvio(p);
      return { ...p, dias: desde ? diasEntre(desde, hoy) : 0, seguimientos: p.seguimientos ?? 0 };
    })
    .filter((p) => p.dias >= DIAS_SEGUIMIENTO)
    .sort((a, b) => b.dias - a.dias);
}

/**
 * Para el aviso al celular: solo el día 7, 14 y 21 de cada una (así no te avisa todos los días).
 */
export const seguimientosParaAvisar = (lista, hoy) =>
  seguimientosPendientes(lista, hoy).filter((p) => p.dias % DIAS_SEGUIMIENTO === 0 && p.dias <= 3 * DIAS_SEGUIMIENTO);

/**
 * Tus números: postulaciones por semana (las últimas 8), cuántas respondieron y qué fuente te responde más.
 */
export function numerosPostulaciones(lista, hoy, semanas = 8) {
  const enviadas = lista.map((p) => ({ ...p, enviada: fechaDeEnvio(p) })).filter((p) => p.enviada);
  const lunes = lunesDe(hoy);
  const porSemana = Array.from({ length: semanas }, (_, i) => {
    const semana = sumarDias(lunes, -7 * (semanas - 1 - i));
    return { semana, cantidad: enviadas.filter((p) => lunesDe(p.enviada.slice(0, 10)) === semana).length };
  });
  const respondieron = enviadas.filter((p) => RESPONDIERON.has(p.etapa));
  const fuentes = new Map();
  for (const p of enviadas) {
    const nombre = p.fuente?.trim() || "Sin fuente";
    const f = fuentes.get(nombre) ?? { fuente: nombre, enviadas: 0, respondieron: 0 };
    f.enviadas++;
    if (RESPONDIERON.has(p.etapa)) f.respondieron++;
    fuentes.set(nombre, f);
  }
  return {
    total: enviadas.length,
    respondieron: respondieron.length,
    tasa: enviadas.length ? Math.round((respondieron.length / enviadas.length) * 100) : null,
    esperando: enviadas.filter((p) => p.etapa === "enviada").length,
    porSemana,
    // Primero la que mejor te responde (en proporción), y en un empate la que más usas
    porFuente: [...fuentes.values()].sort((a, b) => b.respondieron / b.enviadas - a.respondieron / a.enviadas || b.enviadas - a.enviadas),
  };
}

/** Meta semanal de postulaciones (0 = sin meta): cuántas enviaste esta semana. */
export function metaSemanal(lista, hoy, meta = 0) {
  const lunes = lunesDe(hoy);
  const hechas = lista.filter((p) => {
    const f = fechaDeEnvio(p);
    return f && lunesDe(f.slice(0, 10)) === lunes;
  }).length;
  return { meta, hechas, cumplida: meta > 0 && hechas >= meta, faltan: Math.max(0, meta - hechas) };
}

// ---------------------------------------------------------------------------
// Plantillas de mensaje (fijas, sin IA): las completas y las cambias a tu manera antes de enviar
// ---------------------------------------------------------------------------

const unir = (lista, y) => (lista.length <= 1 ? (lista[0] ?? "") : `${lista.slice(0, -1).join(", ")} ${y} ${lista.at(-1)}`);

/**
 * Mensaje para postular a una oferta, con la empresa, el puesto y lo que ya sabes de lo que piden.
 * @param {{ empresa?: string, puesto?: string, tecnologias?: { nombre: string, estado: string }[], cv?: object, idioma?: "es"|"en" }} datos
 */
export function mensajePostulacion({ empresa, puesto, tecnologias = [], cv = {}, idioma = "es" }) {
  const sabes = tecnologias
    .filter((t) => (t.estado === "dominas" || t.estado === "en-progreso") && t.nombre !== "Inglés")
    .map((t) => t.nombre.replace(/ \(.*\)$/, ""))
    .slice(0, 3);
  const stack = sabes.length ? sabes : ["JavaScript", "React"];
  const proyecto = (cv.proyectos ?? []).find((p) => p.titulo?.trim());
  const nombre = cv.nombre?.trim() || (idioma === "en" ? "[your name]" : "[tu nombre]");
  const lugar = empresa?.trim() || (idioma === "en" ? "[company]" : "[empresa]");
  const rol = puesto?.trim() || (idioma === "en" ? "[role]" : "[puesto]");

  if (idioma === "en") {
    return [
      `Hi ${lugar} team,`,
      "",
      `I saw the ${rol} opening and I'm very interested. I'm a junior frontend developer working with ${unir(stack, "and")}.` +
        (proyecto ? ` For example, I built ${proyecto.titulo.trim()}${proyecto.enlace ? ` (${proyecto.enlace.trim()})` : ""}.` : "") +
        (cv.github?.trim() ? ` You can see my projects at ${cv.github.trim()}.` : ""),
      "",
      "I'd love to talk about how I could help the team. My CV is attached.",
      "",
      "Thanks,",
      nombre,
    ].join("\n");
  }
  return [
    `Hola, equipo de ${lugar}:`,
    "",
    `Vi la oferta de ${rol} y me interesa mucho. Trabajo con ${unir(stack, "y")}.` +
      (proyecto
        ? ` Por ejemplo, construí ${proyecto.titulo.trim()}${proyecto.enlace ? ` (${proyecto.enlace.trim()})` : ""}${proyecto.descripcion?.trim() ? `: ${proyecto.descripcion.trim()}` : ""}.`
        : "") +
      (cv.github?.trim() ? ` Mis proyectos están en ${cv.github.trim()}.` : ""),
    "",
    "Me encantaría conversar sobre cómo puedo aportar al equipo. Adjunto mi CV.",
    "",
    "Gracias,",
    nombre,
  ].join("\n");
}

/** Mensaje de seguimiento cuando pasó una semana sin respuesta. */
export function mensajeSeguimiento({ empresa, puesto }, idioma = "es") {
  const lugar = empresa?.trim() || (idioma === "en" ? "[company]" : "[empresa]");
  const rol = puesto?.trim() || (idioma === "en" ? "[role]" : "[puesto]");
  return idioma === "en"
    ? `Hi, I hope you're doing well. Last week I applied for the ${rol} role at ${lugar} and wanted to ask if there are any updates on the process. I'm still very interested and would love to tell you how I could help the team. Thank you for your time!`
    : `Hola, ¿cómo estás? La semana pasada postulé al puesto de ${rol} en ${lugar} y quería saber si hay novedades del proceso. Me sigue interesando mucho y me encantaría contarles cómo puedo aportar al equipo. ¡Gracias por su tiempo!`;
}
