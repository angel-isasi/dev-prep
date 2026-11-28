// Ofertas automáticas: busca ofertas en bolsas de trabajo con API pública y las ordena según
// cuánto te convienen, sin IA (reglas claras que puedes leer aquí abajo).
//
// Fuentes (todas ofrecen su API o su RSS para que otros programas lean sus ofertas; no es scraping):
//   - Get on Board (getonbrd.com): Latinoamérica, mucho trabajo tech, en español.
//   - Remotive, We Work Remotely (RSS: piden citar la fuente), Himalayas (piden postular con su
//     enlace), RemoteOK y Arbeitnow (solo sus ofertas remotas): remotas.
// LinkedIn, Computrabajo y Bumeran no tienen API pública y prohíben el scraping: para esas,
// pega la oferta en "¿Estoy listo para esta oferta?".
//
// Seguridad: cada fuente tiene un nivel de confianza (CONFIANZA) y cada oferta pasa por un detector
// de señales de estafa (senalesDeAlerta) que la marca y la baja en el orden.
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

/** Solo enlaces http(s): una bolsa de trabajo comprometida no podría colar "javascript:" u otro esquema. */
export function urlSegura(valor, respaldo) {
  try {
    const url = new URL(String(valor));
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    // no es una URL
  }
  return respaldo;
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
      url: urlSegura(d.links?.public_url, `https://www.getonbrd.com/jobs/${encodeURIComponent(d.id)}`),
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
    url: urlSegura(j.url, "https://remotive.com/remote-jobs"),
    remoto: true,
    ubicacion: j.candidate_required_location ?? "",
    seniority: null,
    salario: j.salary ? { texto: j.salary } : null,
    fecha: fechaIso(j.publication_date),
    texto: textoPlano(`${(j.tags ?? []).join(", ")}\n${j.description ?? ""}`),
    idioma: "en",
  }));
}

/**
 * Arbeitnow: { data: [{ slug, title, company_name, url, remote, location, created_at, description, tags }] }
 * Solo las remotas: casi todo lo demás es presencial en Alemania y no te sirve.
 */
export function normalizarArbeitnow(json) {
  return (json?.data ?? []).filter((j) => j?.remote).map((j) => ({
    id: `arbeitnow:${j.slug}`,
    fuente: "Arbeitnow",
    titulo: j.title ?? "",
    empresa: j.company_name ?? "",
    url: urlSegura(j.url, "https://www.arbeitnow.com"),
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
      url: urlSegura(j.url, `https://remoteok.com/remote-jobs/${encodeURIComponent(j.id)}`),
      remoto: true,
      ubicacion: j.location ?? "",
      seniority: null,
      salario: j.salary_min || j.salary_max ? { min: j.salary_min || null, max: j.salary_max || null, moneda: "USD" } : null,
      fecha: fechaIso(j.date ?? j.epoch),
      texto: textoPlano(`${(j.tags ?? []).join(", ")}\n${j.description ?? ""}`),
      idioma: "en",
    }));
}

const LATAM =
  /^(peru|argentina|bolivia|brazil|chile|colombia|costa rica|cuba|dominican republic|ecuador|el salvador|guatemala|honduras|mexico|nicaragua|panama|paraguay|uruguay|venezuela)$/i;

/**
 * Himalayas: { jobs: [{ title, companyName, applicationLink, guid, locationRestrictions, seniority, minSalary, maxSalary, currency, pubDate, description, categories }] }
 * locationRestrictions vacío = desde cualquier país. Piden postular con su applicationLink.
 */
export function normalizarHimalayas(json) {
  return (json?.jobs ?? [])
    .filter((j) => j && j.title)
    .map((j) => {
      const paises = (j.locationRestrictions ?? []).filter((p) => typeof p === "string");
      const latam = paises.filter((p) => LATAM.test(p));
      const ubicacion = !paises.length
        ? "Worldwide"
        : paises.some((p) => /^peru$/i.test(p))
          ? "Peru"
          : latam.length
            ? `LATAM (${latam.slice(0, 3).join(", ")})`
            : paises.slice(0, 3).join(", ") + (paises.length > 3 ? ` y ${paises.length - 3} más` : "");
      const slug = String(j.guid ?? j.applicationLink ?? j.title).split("/").filter(Boolean).slice(-2).join("/");
      return {
        id: `himalayas:${slug}`,
        fuente: "Himalayas",
        titulo: j.title,
        empresa: j.companyName ?? "",
        url: urlSegura(j.applicationLink, urlSegura(j.guid, "https://himalayas.app/jobs")),
        remoto: true,
        ubicacion,
        // Solo para ciertos países y ninguno es de Latinoamérica
        soloOtrosPaises: paises.length > 0 && latam.length === 0,
        seniority: (j.seniority ?? []).join(", ") || null,
        salario: j.minSalary || j.maxSalary ? { min: j.minSalary ?? null, max: j.maxSalary ?? null, moneda: j.currency ?? "USD" } : null,
        fecha: fechaIso(j.pubDate),
        texto: textoPlano(`${(j.categories ?? []).join(", ").replace(/-/g, " ")}\n${j.description ?? ""}`),
        idioma: "en",
      };
    });
}

const ENTIDADES_XML = { "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'" };
/** Texto de una etiqueta RSS: quita CDATA y decodifica las entidades XML (la descripción trae HTML escapado). */
function desXml(texto = "") {
  return String(texto)
    .replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1")
    .replace(/&(lt|gt|quot|apos|#39);/g, (e) => ENTIDADES_XML[e])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .trim();
}
const etiqueta = (item, nombre) => desXml(new RegExp(`<${nombre}>([\\s\\S]*?)</${nombre}>`).exec(item)?.[1] ?? "");

/** We Work Remotely (RSS): <item><title>Empresa: Puesto</title><region>, <country>, <pubDate>, <link>, <description> */
export function normalizarWeWorkRemotely(xml) {
  const items = String(xml ?? "").match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items
    .map((item) => {
      const completo = etiqueta(item, "title");
      const corte = completo.indexOf(": ");
      const link = etiqueta(item, "link");
      return {
        id: `wwr:${link.split("/").filter(Boolean).pop() ?? completo}`,
        fuente: "We Work Remotely",
        titulo: corte > 0 ? completo.slice(corte + 2) : completo,
        empresa: corte > 0 ? completo.slice(0, corte) : "",
        url: urlSegura(link, "https://weworkremotely.com"),
        remoto: true,
        ubicacion: [etiqueta(item, "region"), etiqueta(item, "country")].filter(Boolean).join(", "),
        seniority: null,
        salario: null,
        fecha: fechaIso(etiqueta(item, "pubDate") || null),
        texto: textoPlano(`${etiqueta(item, "skills")}\n${etiqueta(item, "description")}`),
        idioma: "en",
      };
    })
    .filter((o) => o.titulo);
}

/**
 * Cuánto fiarte de cada fuente (no reemplaza verificar la empresa):
 *   alta: modera cada aviso antes de publicarlo · media: bolsa conocida, verifica igual · baja: se han colado estafas.
 */
export const CONFIANZA = {
  "Get on Board": { nivel: "alta", texto: "Revisada", detalle: "Get on Board modera cada aviso antes de publicarlo." },
  Remotive: {
    nivel: "media",
    texto: "Bolsa conocida",
    detalle: "Remotive revisa a las empresas, pero nunca te escribe directo: si alguien dice ser de Remotive, es estafa.",
  },
  "We Work Remotely": {
    nivel: "media",
    texto: "Bolsa conocida",
    detalle: "We Work Remotely cobra a las empresas por publicar, y eso filtra muchas estafas. Igual verifica la empresa.",
  },
  Himalayas: { nivel: "media", texto: "Bolsa conocida", detalle: "Himalayas es una bolsa remota conocida. Postula siempre desde su enlace." },
  Arbeitnow: { nivel: "media", texto: "Bolsa conocida", detalle: "Arbeitnow es una bolsa conocida de Alemania. Verifica la empresa." },
  RemoteOK: {
    nivel: "baja",
    texto: "Verifica la empresa",
    detalle: "En RemoteOK se han colado avisos falsos, incluso marcados como verificados. Busca la empresa antes de postular.",
  },
  // Estas llegan por tus alertas de correo (ver ofertas-correo.js)
  LinkedIn: {
    nivel: "media",
    texto: "De tu correo",
    detalle: "Llegó en tu alerta de LinkedIn. Postula desde LinkedIn y desconfía de quien te pida pagar o pasar a WhatsApp.",
  },
  Glassdoor: {
    nivel: "media",
    texto: "De tu correo",
    detalle: "Llegó en tu alerta de Glassdoor. Mira las opiniones de la empresa en Glassdoor antes de postular.",
  },
  Bumeran: {
    nivel: "media",
    texto: "De tu correo",
    detalle: "Llegó en tu correo de Bumeran. El enlace abre la búsqueda del puesto: postula desde Bumeran y no pagues por postular.",
  },
};
const ORDEN_CONFIANZA = { alta: 0, media: 1, baja: 2 };
export const confianzaDe = (fuente) =>
  CONFIANZA[fuente] ?? { nivel: "media", texto: "Verifica la empresa", detalle: "Verifica la empresa antes de postular." };

/**
 * Las fuentes, con su URL de búsqueda, su normalizador y si el navegador puede leerlas directo (CORS).
 * Van de la más confiable a la menos: al quitar repetidas gana la primera.
 */
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
  {
    id: "arbeitnow",
    nombre: "Arbeitnow",
    navegador: true,
    urls: ["https://www.arbeitnow.com/api/job-board-api"],
    normalizar: normalizarArbeitnow,
  },
  {
    id: "weworkremotely",
    nombre: "We Work Remotely",
    navegador: true,
    formato: "xml",
    urls: [
      "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
      "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    ],
    normalizar: normalizarWeWorkRemotely,
  },
  {
    // Sin CORS: solo desde el motor de la laptop y la Lambda
    id: "himalayas",
    nombre: "Himalayas",
    navegador: false,
    urls: [
      "https://himalayas.app/jobs/api/search?q=frontend&seniority=Entry-level&limit=20",
      "https://himalayas.app/jobs/api/search?q=react&seniority=Entry-level&limit=20",
      "https://himalayas.app/jobs/api/search?q=javascript&seniority=Entry-level&limit=20",
    ],
    normalizar: normalizarHimalayas,
  },
  // Al final: si la misma oferta está en dos bolsas, se queda la de la más confiable (ver sinRepetir)
  { id: "remoteok", nombre: "RemoteOK", navegador: true, urls: ["https://remoteok.com/api"], normalizar: normalizarRemoteOK },
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
            const xml = f.formato === "xml";
            const r = await pedir(url, {
              signal: AbortSignal.timeout(espera),
              headers: { Accept: xml ? "application/rss+xml, application/xml" : "application/json" },
            });
            if (!r.ok) return null;
            return f.normalizar(xml ? await r.text() : await r.json());
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

// Misma oferta en dos fuentes: igual puesto y empresa, sin contar guiones ni "Inc", "LLC", "S.A.C."...
const SUFIJOS = /\b(inc|llc|ltd|limited|corp|corporation|co|gmbh|sa|sac|saa|srl|sas|spa|ag|bv|plc)\b\.?/g;
const clave = (o) =>
  `${o.titulo}|${String(o.empresa ?? "")
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(SUFIJOS, "")}`
    .toLowerCase()
    .replace(/[^a-z0-9|]/g, "");
export function sinRepetir(ofertas) {
  const ids = new Set();
  const claves = new Set();
  const unicas = [];
  for (const o of ofertas) {
    const k = clave(o);
    if (ids.has(o.id) || claves.has(k)) continue;
    ids.add(o.id);
    claves.add(k);
    unicas.push(o);
  }
  return unicas;
}

// ---------------------------------------------------------------------------
// Puntaje: cuánto te conviene una oferta (0 a 100) y por qué
// ---------------------------------------------------------------------------

const FRONTEND =
  /\b(front[\s-]?end|frontend|react|javascript|typescript|web developer|desarrollador(a)? web|desarrollo web|programador(\(a\)|a)? web|ui developer|vue|angular|next\.?js)\b/i;
// Puestos de programación en general ("Programador junior", "Desarrollador de software", "Practicante de sistemas"):
// para un practicante cuentan, aunque por debajo de los de frontend
const DESARROLLO =
  /\b(programador(\(a\)|a)?|programaci[oó]n|desarrollador(\(a\)|a)?|desarrollo de software|software developer|software engineer|developer|analista programador|practicante (pre[\s-]?profesional )?(de )?(sistemas|desarrollo|ti)\b)/i;
// En Ica (su ciudad) un puesto presencial le sirve; en otra ciudad de Perú, solo si es remoto
const CIUDAD = /\bica\b/i;
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
  /\b(usa only|us only|united states only|eu only|europe only|uk only|must be located in (the )?(us|usa|europe|uk)|us citizens?|green card|u\.?s\.?[\s-]based|usa[\s-]based)\b/i;
const ANIOS = /(\d{1,2})\s*\+?\s*(a[nñ]os|years?)(\s+de)?\s+(experiencia|of experience|experience)/i;

// ---------------------------------------------------------------------------
// Señales de estafa: frases típicas de avisos falsos. Una sola no prueba nada, pero pide cuidado.
// ---------------------------------------------------------------------------

const ALERTAS = [
  {
    // "escríbenos por WhatsApp al +51...", "add us on Telegram @reclutador"
    patron:
      /\b(contact|message|text|write|send|apply|reach|add|escr[ií]be(nos)?|env[ií]a|post[uú]la|cont[aá]cta(nos)?|mensaje)\b[^.\n]{0,40}\b(whats\s?app|telegram|signal)\b|\b(whats\s?app|telegram)\b[^.\n]{0,25}(\+?\d[\d\s-]{6,}|@\w{3,})/i,
    texto: "Pide contacto por WhatsApp o Telegram: las empresas serias usan su correo o su web",
  },
  {
    // Solo cuando te lo piden a ti ("you must purchase", "pay for your equipment"): "reimbursement" a secas
    // aparece en beneficios reales (seguro, equipo de oficina) y no cuenta.
    patron:
      /\b(you|candidates?|applicants?)\b[^.\n]{0,25}\b(need to|must|have to|will have to|are required to|required to)\b[^.\n]{0,15}\b(pay|purchase|buy)\b|\bpay for (your )?(own )?(equipment|laptop|software|training|starter kit|certificat\w*)|\b(purchase|buy)\b[^.\n]{0,40}\b(equipment|laptop|software|starter kit)\b[^.\n]{0,60}\b(reimburs\w*|paid back|pay you back)|\b(registration|training|application|onboarding|processing) fee|\b(debes|deber[aá]s|tienes que|tendr[aá]s que|necesitas)\s+(pagar|comprar|abonar|depositar)|\b(pagar|pago|dep[oó]sito|comprar|abonar)\b[^.\n]{0,40}\b(curso|capacitaci[oó]n|kit|inscripci[oó]n|certificad\w*|materiales)\b/i,
    texto: "Habla de que pagues algo (equipo, curso o inscripción): nunca pagues por un trabajo",
  },
  {
    patron:
      /\b(forex|binary options|trading signals?|pig butcher\w*|guaranteed (profits?|returns|income)|high returns|ganancias garantizadas)\b/i,
    texto: "Promete ganancias o habla de trading: así se disfrazan estafas de inversión",
  },
  {
    patron:
      /\b(how to work online|data entry|typing jobs?|like and follow|simple (online )?tasks|tareas simples|dar me gusta|earn \$?\d[\d,]* (per|a|an|each) (day|hour))\b/i,
    texto: "Suena a 'tareas simples por internet', una estafa muy común",
  },
  {
    patron: /\b(no interview|sin entrevista|hired immediately|immediate hire|contrataci[oó]n inmediata)\b/i,
    texto: "Promete contratarte sin entrevista o al instante",
  },
  {
    patron: /[a-z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|proton(mail)?)\.(com|me|es|pe)\b/i,
    texto: "Pide postular a un correo personal (Gmail, Hotmail...), no a uno de la empresa",
  },
  {
    patron:
      /\b(bank account|bank details|cuenta bancaria|datos bancarios|social security|ssn|passport|pasaporte|dni)\b[^.\n]{0,50}\b(before|antes|send|env[ií]a|upload|sube|share|comparte)\b|\b(send|env[ií]a|upload|sube|share|comparte)\b[^.\n]{0,30}\b(bank account|bank details|cuenta bancaria|datos bancarios|passport|pasaporte|dni)\b/i,
    texto: "Pide tus datos bancarios o documentos antes de un contrato",
  },
];

/**
 * ¿Sueldo demasiado alto para un junior? Las bolsas mezclan anual (Himalayas, RemoteOK) y mensual
 * (Get on Board). Anual: más de 150 000 USD (en EE. UU. 90 000 para un junior es normal). Mensual: más de 6000 USD.
 */
function sueldoIrreal(salario) {
  const min = Number(salario?.min);
  if (!min || (salario.moneda && salario.moneda !== "USD")) return false;
  return min > 20_000 ? min > 150_000 : min > 6000;
}

/**
 * Señales de estafa en una oferta. Sin IA: frases conocidas de avisos falsos.
 * @returns {string[]}  una frase por señal (vacío = no se vio nada raro)
 */
export function senalesDeAlerta(oferta) {
  const titulo = oferta.titulo ?? "";
  const todo = `${titulo}\n${oferta.texto ?? ""}`;
  const alertas = ALERTAS.filter((a) => a.patron.test(todo)).map((a) => a.texto);
  if (/\b(crypto|cripto|forex|trading)\b/i.test(titulo) && JUNIOR.test(titulo))
    alertas.push("Puesto junior de cripto o trading: hay estafas que se disfrazan así. Investiga bien a la empresa");
  if (sueldoIrreal(oferta.salario) && (JUNIOR.test(titulo) || /junior|entry|trainee/i.test(oferta.seniority ?? "")))
    alertas.push("Sueldo muy por encima de lo normal para un junior: desconfía");
  return alertas;
}

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
  const esDesarrollo = !esFrontend && !esFull && DESARROLLO.test(titulo) && !OTRO_ROL.test(titulo) && !/soporte|t[eé]cnico|datos|inteligencia artificial|\bia\b|odoo|vb6|wpf|outsystems|python|java\b|\.net|dise[nñ]o gr[aá]fico/i.test(titulo);
  const relevante =
    esFull ||
    esDesarrollo ||
    (esFrontend && !/\b(back[\s-]?end|mobile|ios|android|qa)\b/i.test(titulo)) ||
    (!OTRO_ROL.test(titulo) &&
      FRONTEND.test(oferta.texto ?? "") &&
      /\b(software|web)\b.*\b(develop|engineer)|desarrollador|developer|programador/i.test(titulo));
  const confianza = confianzaDe(oferta.fuente);
  if (!relevante)
    return {
      puntaje: 0,
      razones: [{ texto: "No es un puesto de desarrollo web", tipo: "en-contra" }],
      tecnologias: [],
      relevante: false,
      alertas: [],
      confianza,
    };

  // Señales de estafa primero: si hay, son lo más importante que tienes que leer
  const alertas = senalesDeAlerta(oferta);
  for (const a of alertas.slice(0, 2)) sumar(-25, `Posible estafa: ${a}`);

  if (esFrontend) sumar(15, "Es un puesto de frontend");
  else if (esFull) sumar(6, "Es full stack: incluye frontend");
  else if (esDesarrollo) sumar(0, "Es de programación en general: pregunta si incluye frontend");

  // Nivel
  const senior = SENIOR.test(titulo) || /senior|lead/i.test(oferta.seniority ?? "");
  const junior = JUNIOR.test(titulo) || /junior|trainee|sin experiencia|entry/i.test(oferta.seniority ?? "");
  if (junior) sumar(25, "Busca junior, practicante o trainee");
  else if (senior) sumar(-35, "Pide nivel senior o líder");
  else if (/semi/i.test(oferta.seniority ?? "")) sumar(-10, "Pide nivel semi senior");
  // Sin sueldo no te sirve (descartas ad honorem y voluntariados)
  if (/ad[\s-]?honorem|sin remuneraci[oó]n|no remunerad|voluntariado/i.test(todo)) sumar(-40, "No es pagada (ad honorem o voluntariado)");
  const anios = Number(ANIOS.exec(todo)?.[1]);
  if (anios >= 3) sumar(-15, `Pide ${anios} o más años de experiencia`);
  else if (anios > 0 && anios <= 2) sumar(5, `Pide poca experiencia (${anios} ${anios === 1 ? "año" : "años"})`);

  // Lugar
  let lugarOk = false;
  if (
    oferta.soloOtrosPaises ||
    SOLO_LEJOS.test(todo) ||
    /^(usa|us|united states|uk|europe|germany|deutschland)/i.test(oferta.ubicacion ?? "")
  )
    sumar(-20, "Solo para personas en otro país");
  else if (CIUDAD.test(oferta.ubicacion ?? "")) {
    sumar(20, "Es en Ica, tu ciudad");
    lugarOk = true;
  } else if (PERU.test(`${oferta.ubicacion} ${todo}`)) {
    // Remoto desde Ica sí; presencial en Lima u otra ciudad, no (sin dato de modalidad, cuenta como presencial)
    if (oferta.remoto) {
      sumar(15, "Es en Perú y remoto");
      lugarOk = true;
    } else sumar(-12, "Presencial fuera de Ica: pregunta si puede ser remoto");
  } else if (oferta.remoto && LUGAR_BUENO.test(`${oferta.ubicacion} remote`)) {
    sumar(10, "Remoto y abierto a Latinoamérica");
    lugarOk = true;
  } else if (!oferta.remoto) sumar(-25, "Presencial en otro país");

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
  // LinkedIn, Glassdoor, Indeed y las demás alertas del correo suelen dejar de recibir postulaciones en 1 o 2 semanas
  else if (dias != null && dias > 10 && /linkedin|glassdoor|indeed|computrabajo|bumeran/i.test(oferta.fuente ?? ""))
    sumar(-15, `Lleva ${dias} días: en ${oferta.fuente} suelen cerrar rápido, revisa si sigue abierta`);

  // Para el aviso al celular: lo que importa sin depender de tu mapa (la Lambda no lo tiene)
  const paraAvisar = junior && !senior && lugarOk && dias != null && dias <= 7 && alertas.length === 0;
  // "Solo para mí": junior o práctica, en Perú o remota para Latinoamérica, y de frontend o con React/JavaScript
  // Un puesto de programación general cuenta si no pide un lenguaje que no es el tuyo (Elixir, PHP, C#...)
  const otroLenguaje = /\b(elixir|ruby|golang|rust|c\+\+|c#|php|kotlin|swift|scala|cobol|abap)\b/i.test(titulo);
  const usaTuStack = esFrontend || esFull || (esDesarrollo && !otroLenguaje) || tecnologias.some((t) => t.nombre === "React" || t.nombre === "JavaScript");
  const paraMi = junior && !senior && lugarOk && usaTuStack && alertas.length === 0;
  return {
    puntaje: Math.max(1, Math.min(100, Math.round(puntaje))),
    razones,
    tecnologias,
    relevante: true,
    paraAvisar,
    alertas,
    confianza,
    junior: junior && !senior,
    lugarOk,
    paraMi,
  };
}

/**
 * Las ofertas que valen la pena, de la que más te conviene a la que menos. En un empate gana la
 * fuente más confiable (Get on Board primero) y después la más nueva.
 */
export function ordenarOfertas(ofertas, perfil, { limite = 40 } = {}) {
  return ofertas
    .map((o) => ({ ...o, ...puntuarOferta(o, perfil) }))
    .filter((o) => o.relevante)
    .sort(
      (a, b) =>
        b.puntaje - a.puntaje ||
        ORDEN_CONFIANZA[a.confianza.nivel] - ORDEN_CONFIANZA[b.confianza.nivel] ||
        (b.fecha ?? "").localeCompare(a.fecha ?? ""),
    )
    .slice(0, limite);
}

/**
 * "Nuevas desde tu última visita": los ids que no estaban en tu visita anterior.
 * Sin visita anterior (la primera vez) no marca ninguna, para no decirte que todo es nuevo.
 * @param {string[]} ids        los de ahora
 * @param {string[]|null} antes los que viste la vez pasada
 */
export function nuevasDesde(ids, antes) {
  if (!antes) return [];
  const vistas = new Set(antes);
  return ids.filter((id) => !vistas.has(id));
}

/**
 * Las ofertas que valen un aviso al celular y que no te avisé antes: de frontend o full stack,
 * para junior, en Perú o remotas para Latinoamérica, y publicadas en los últimos 7 días.
 * @param {object[]} ordenadas  las de ordenarOfertas
 * @param {string[]} yaAvisadas  ids de ofertas que ya viste en un aviso
 */
export const ofertasParaAvisar = (ordenadas, yaAvisadas = []) => ordenadas.filter((o) => o.paraAvisar && !yaAvisadas.includes(o.id));
