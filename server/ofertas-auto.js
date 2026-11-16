// Ofertas automáticas: busca ofertas en bolsas de trabajo con API pública y las ordena según
// cuánto te convienen, sin IA (reglas claras que puedes leer aquí abajo).
//
// Fuentes (todas ofrecen su API para que otros programas lean sus ofertas; no es scraping):
//   - Get on Board (getonbrd.com): Latinoamérica, mucho trabajo tech, en español.
//   - Remotive (remotive.com), RemoteOK (remoteok.com) y Arbeitnow (arbeitnow.com): remotas.
// LinkedIn, Computrabajo y Bumeran no tienen API pública y prohíben el scraping: para esas,
// pega la oferta en "¿Estoy listo para esta oferta?".
//
// Funciones puras salvo buscarOfertas, que recibe `fetch` por parámetro (así sirve en la laptop,
// en el navegador y en los tests).
import { analizarOferta } from "./ofertas.js";

const ENTIDADES = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

/** HTML de una descripción a texto plano corto. */
export function textoPlano(html = "", max = 4000) {
  return String(html)
    .replace(/<\/(p|li|h\d|div|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTIDADES[e.toLowerCase()] ?? " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
    .slice(0, max);
}

const fechaIso = (valor) => {
  if (valor == null) return null;
  const d = typeof valor === "number" ? new Date(valor < 1e12 ? valor * 1000 : valor) : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** Get on Board: { data: [{ id, attributes, links }] } */
export function normalizarGetOnBoard(json) {
  return (json?.data ?? []).map((d) => {
    const a = d.attributes ?? {};
    const texto = textoPlano([a.description, a.functions, a.desirable].filter(Boolean).join("\n"));
    return {
      id: `gob:${d.id}`,
      fuente: "Get on Board",
      titulo: a.title ?? "",
      empresa: a.company?.data?.attributes?.name ?? "",
      url: d.links?.public_url ?? `https://www.getonbrd.com/jobs/${d.id}`,
      remoto: !!a.remote || /remote/.test(a.remote_modality ?? ""),
      // countries y location_cities a veces vienen como lista y a veces como objeto: solo se toman los textos
      ubicacion: [a.countries, a.location_cities]
        .flatMap((v) => (Array.isArray(v) ? v : []))
        .filter((x) => typeof x === "string")
        .join(", "),
      seniority: a.seniority?.data?.attributes?.name ?? null,
      salario: a.min_salary || a.max_salary ? { min: a.min_salary ?? null, max: a.max_salary ?? null, moneda: "USD" } : null,
      fecha: fechaIso(a.published_at),
      texto,
      idioma: a.lang ?? null,
    };
  });
}

/** Remotive: { jobs: [{ id, title, company_name, url, candidate_required_location, salary, publication_date, description, tags }] } */
export function normalizarRemotive(json) {
  return (json?.jobs ?? []).map((j) => ({
    id: `remotive:${j.id}`,
    fuente: "Remotive",
    titulo: j.title ?? "",
    empresa: j.company_name ?? "",
    url: j.url,
    remoto: true,
    ubicacion: j.candidate_required_location ?? "",
    seniority: null,
    salario: j.salary ? { texto: j.salary } : null,
    fecha: fechaIso(j.publication_date),
    texto: textoPlano(`${(j.tags ?? []).join(", ")}\n${j.description ?? ""}`),
    idioma: "en",
  }));
}

/** Arbeitnow: { data: [{ slug, title, company_name, url, remote, location, created_at, description, tags }] } */
export function normalizarArbeitnow(json) {
  return (json?.data ?? []).map((j) => ({
    id: `arbeitnow:${j.slug}`,
    fuente: "Arbeitnow",
    titulo: j.title ?? "",
    empresa: j.company_name ?? "",
    url: j.url,
    remoto: !!j.remote,
    ubicacion: j.location ?? "",
    seniority: null,
    salario: null,
    fecha: fechaIso(j.created_at),
    texto: textoPlano(`${(j.tags ?? []).join(", ")}\n${j.description ?? ""}`),
    idioma: "en",
  }));
}

/** RemoteOK: [ { legal }, { id, position, company, url, location, date, description, tags, salary_min, salary_max } ] */
export function normalizarRemoteOK(json) {
  return (Array.isArray(json) ? json : [])
    .filter((j) => j && j.id && j.position)
    .map((j) => ({
      id: `remoteok:${j.id}`,
      fuente: "RemoteOK",
      titulo: j.position,
      empresa: j.company ?? "",
      url: j.url ?? `https://remoteok.com/remote-jobs/${j.id}`,
      remoto: true,
      ubicacion: j.location ?? "",
      seniority: null,
      salario: j.salary_min || j.salary_max ? { min: j.salary_min || null, max: j.salary_max || null, moneda: "USD" } : null,
      fecha: fechaIso(j.date ?? j.epoch),
      texto: textoPlano(`${(j.tags ?? []).join(", ")}\n${j.description ?? ""}`),
      idioma: "en",
    }));
}

/** Las fuentes, con su URL de búsqueda, su normalizador y si el navegador puede leerlas directo (CORS). */
export const FUENTES = [
  {
    id: "getonbrd",
    nombre: "Get on Board",
    navegador: false,
    urls: [
      "https://www.getonbrd.com/api/v0/search/jobs?query=frontend&per_page=50&expand=[%22company%22,%22seniority%22]",
      "https://www.getonbrd.com/api/v0/search/jobs?query=react&per_page=50&expand=[%22company%22,%22seniority%22]",
      "https://www.getonbrd.com/api/v0/search/jobs?query=junior&per_page=50&expand=[%22company%22,%22seniority%22]",
    ],
    normalizar: normalizarGetOnBoard,
  },
  {
    id: "remotive",
    nombre: "Remotive",
    navegador: true,
    urls: ["https://remotive.com/api/remote-jobs?category=software-dev&limit=150"],
    normalizar: normalizarRemotive,
  },
  { id: "remoteok", nombre: "RemoteOK", navegador: true, urls: ["https://remoteok.com/api"], normalizar: normalizarRemoteOK },
  {
    id: "arbeitnow",
    nombre: "Arbeitnow",
    navegador: true,
    urls: ["https://www.arbeitnow.com/api/job-board-api"],
    normalizar: normalizarArbeitnow,
  },
];

/**
 * Busca en las fuentes (las que fallen se saltan) y devuelve las ofertas sin repetir.
 * @param {typeof fetch} pedir
 * @param {{ soloNavegador?: boolean, espera?: number }} opciones
 * @returns {Promise<{ ofertas: object[], fuentes: { id: string, nombre: string, ok: boolean, cantidad: number }[] }>}
 */
export async function buscarOfertas(pedir, { soloNavegador = false, espera = 15_000 } = {}) {
  const usadas = FUENTES.filter((f) => !soloNavegador || f.navegador);
  const resultados = await Promise.all(
    usadas.map(async (f) => {
      const listas = await Promise.all(
        f.urls.map(async (url) => {
          try {
            const r = await pedir(url, { signal: AbortSignal.timeout(espera), headers: { Accept: "application/json" } });
            if (!r.ok) return null;
            return f.normalizar(await r.json());
          } catch {
            return null;
          }
        }),
      );
      const ok = listas.some((l) => l != null);
      return {
        fuente: { id: f.id, nombre: f.nombre, ok, cantidad: listas.flat().filter(Boolean).length },
        ofertas: listas.flat().filter(Boolean),
      };
    }),
  );
  return { ofertas: sinRepetir(resultados.flatMap((r) => r.ofertas)), fuentes: resultados.map((r) => r.fuente) };
}

const clave = (o) => `${o.titulo}|${o.empresa}`.toLowerCase().replace(/[^a-z0-9|]/g, "");
export function sinRepetir(ofertas) {
  const vistas = new Map();
  for (const o of ofertas) if (!vistas.has(o.id) && ![...vistas.values()].some((v) => clave(v) === clave(o))) vistas.set(o.id, o);
  return [...vistas.values()];
}

// ---------------------------------------------------------------------------
// Puntaje: cuánto te conviene una oferta (0 a 100) y por qué
// ---------------------------------------------------------------------------

const FRONTEND =
  /\b(front[\s-]?end|frontend|react|javascript|typescript|web developer|desarrollador web|ui developer|vue|angular|next\.?js)\b/i;
const FULLSTACK = /\b(full[\s-]?stack|fullstack)\b/i;
const OTRO_ROL =
  /\b(back[\s-]?end|data (engineer|scientist|analyst)|devops|sre|machine learning|ml engineer|ai engineer|no[\s-]?code|ios|android|mobile|qa|tester|sales|marketing|designer|recruiter|account|support|customer|content|writer|hardware|mechanical|embedded|golang|java developer|php developer|salesforce|sap|integrations?)\b/i;
const JUNIOR =
  /\b(junior|jr\.?|trainee|practicante|pr[aá]cticas?|intern(ship)?|entry[\s-]?level|graduate|sin experiencia|praktikum|werkstudent|working student)\b/i;
const PERU = /\b(per[uú]|lima|peruvian?a?)\b/i;
const SENIOR = /\b(senior|sr\.?|lead|l[ií]der|staff|principal|architect|arquitect[oa]|head of|manager|gerente)\b/i;
const LUGAR_BUENO =
  /\b(per[uú]|lima|latam|latin america|latinoam[eé]rica|south america|sudam[eé]rica|americas|worldwide|anywhere|global|remote)\b/i;
const SOLO_LEJOS =
  /\b(usa only|us only|united states only|eu only|europe only|uk only|must be located in (the )?(us|usa|europe|uk)|us citizens?|green card)\b/i;
const ANIOS = /(\d{1,2})\s*\+?\s*(a[nñ]os|years?)(\s+de)?\s+(experiencia|of experience|experience)/i;

/**
 * @param {object} oferta  una oferta normalizada
 * @param {{ mapa?: object[], ingles?: { inglesDominadas?: number, inglesTotal?: number }, hoy?: string }} perfil
 * @returns {{ puntaje: number, razones: { texto: string, tipo: "a-favor"|"en-contra" }[], tecnologias: object[], relevante: boolean }}
 */
export function puntuarOferta(oferta, { mapa = [], ingles = {}, hoy = new Date().toISOString().slice(0, 10) } = {}) {
  const titulo = oferta.titulo ?? "";
  const todo = `${titulo}\n${oferta.texto ?? ""}`;
  const razones = [];
  let puntaje = 40;
  const sumar = (n, texto) => {
    puntaje += n;
    razones.push({ texto, tipo: n >= 0 ? "a-favor" : "en-contra" });
  };

  // ¿Es un puesto de desarrollo web?
  const esFrontend = FRONTEND.test(titulo);
  const esFull = FULLSTACK.test(titulo);
  const relevante =
    esFull ||
    (esFrontend && !/\b(back[\s-]?end|mobile|ios|android|qa)\b/i.test(titulo)) ||
    (!OTRO_ROL.test(titulo) &&
      FRONTEND.test(oferta.texto ?? "") &&
      /\b(software|web)\b.*\b(develop|engineer)|desarrollador|developer|programador/i.test(titulo));
  if (!relevante)
    return { puntaje: 0, razones: [{ texto: "No es un puesto de desarrollo web", tipo: "en-contra" }], tecnologias: [], relevante: false };
  if (esFrontend) sumar(15, "Es un puesto de frontend");
  else if (esFull) sumar(6, "Es full stack: incluye frontend");

  // Nivel
  const senior = SENIOR.test(titulo) || /senior|lead/i.test(oferta.seniority ?? "");
  const junior = JUNIOR.test(titulo) || /junior|trainee|sin experiencia|entry/i.test(oferta.seniority ?? "");
  if (junior) sumar(25, "Busca junior, practicante o trainee");
  else if (senior) sumar(-35, "Pide nivel senior o líder");
  else if (/semi/i.test(oferta.seniority ?? "")) sumar(-10, "Pide nivel semi senior");
  const anios = Number(ANIOS.exec(todo)?.[1]);
  if (anios >= 3) sumar(-15, `Pide ${anios} o más años de experiencia`);
  else if (anios > 0 && anios <= 2) sumar(5, `Pide poca experiencia (${anios} ${anios === 1 ? "año" : "años"})`);

  // Lugar
  if (SOLO_LEJOS.test(todo) || /^(usa|us|united states|uk|europe|germany|deutschland)/i.test(oferta.ubicacion ?? ""))
    sumar(-20, "Solo para personas en otro país");
  else if (PERU.test(`${oferta.ubicacion} ${todo}`)) sumar(15, "Es en Perú o acepta Perú");
  else if (oferta.remoto && LUGAR_BUENO.test(`${oferta.ubicacion} remote`)) sumar(10, "Remoto y abierto a Latinoamérica");
  else if (!oferta.remoto) sumar(-25, "Presencial en otro país");

  // Tecnologías contra lo que dominas (el mismo diccionario de "¿Estoy listo para esta oferta?")
  const { tecnologias } = analizarOferta(todo, mapa, ingles);
  const domina = tecnologias.filter((t) => t.estado === "dominas").length;
  const progreso = tecnologias.filter((t) => t.estado === "en-progreso").length;
  const faltan = tecnologias.filter((t) => t.estado === "por-empezar" || t.estado === "no-esta").length;
  if (tecnologias.length) {
    const ajuste = Math.max(-15, Math.min(20, domina * 5 + progreso * 2 - faltan * 2));
    if (ajuste !== 0)
      sumar(ajuste, `Tecnologías: dominas ${domina}, estás aprendiendo ${progreso} y te faltan ${faltan} de ${tecnologias.length}`);
  }

  // Inglés
  const pideIngles = oferta.idioma === "en" || /\b(english|ingl[eé]s)\b/i.test(todo);
  const nivelIngles = ingles.inglesTotal ? (ingles.inglesDominadas ?? 0) / ingles.inglesTotal : 0;
  if (pideIngles && nivelIngles < 0.4) sumar(-5, "Está en inglés o lo pide: sigue con tu rutina de inglés");

  // Qué tan nueva es
  const dias = oferta.fecha ? Math.floor((Date.parse(hoy) - Date.parse(oferta.fecha.slice(0, 10))) / 86_400_000) : null;
  if (dias != null && dias <= 3) sumar(8, "Publicada hace poco: postula pronto");
  else if (dias != null && dias > 90) sumar(-40, `Tiene ${Math.floor(dias / 30)} meses publicada: probablemente ya cerró`);
  else if (dias != null && dias > 45) sumar(-25, "Tiene más de mes y medio publicada: puede que ya esté cerrada");
  else if (dias != null && dias > 30) sumar(-10, "Tiene más de un mes publicada");

  return { puntaje: Math.max(1, Math.min(100, Math.round(puntaje))), razones, tecnologias, relevante: true };
}

/** Las ofertas que valen la pena, de la que más te conviene a la que menos. */
export function ordenarOfertas(ofertas, perfil, { limite = 40 } = {}) {
  return ofertas
    .map((o) => ({ ...o, ...puntuarOferta(o, perfil) }))
    .filter((o) => o.relevante)
    .sort((a, b) => b.puntaje - a.puntaje || (b.fecha ?? "").localeCompare(a.fecha ?? ""))
    .slice(0, limite);
}
