// Hacer el CV de una oferta (a pedido o solo) y guardarlo junto a ella. La IA adapta tu CV base sin
// inventar (ver la tarea "cv-oferta" en server/ia-tareas.js); qué ofertas reciben su CV solas lo decide
// ofertasParaCvAuto (server/cv-oferta.js), sin IA.
import { ofertasParaCvAuto, resumenBusqueda } from "../../../server/cv-oferta.js";
import { api } from "./api.js";
import { claveIa, pedirIa } from "./ia.js";
import { ES_VISITA } from "./visita.js";

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Pide a la IA el CV para una oferta y lo guarda. Devuelve el registro guardado.
 * @param {{ id: string, oferta: string, titulo?: string, empresa?: string, url?: string, puntaje?: number, fuente?: string, auto?: boolean }} o
 */
export async function generarCvOferta(o) {
  const [base, perfil] = await Promise.all([api.cvBase(), api.cv()]);
  const cv = await pedirIa({ tarea: "cv-oferta", base: base.texto, nombre: perfil.datos?.nombre, oferta: o.oferta });
  const registro = {
    creado: new Date().toISOString(),
    fecha: hoy(),
    titulo: o.titulo || cv.puesto || "Oferta",
    empresa: o.empresa || cv.empresa || "",
    url: o.url ?? "",
    fuente: o.fuente ?? "",
    puntaje: o.puntaje ?? null,
    auto: !!o.auto,
    oferta: String(o.oferta).slice(0, 6000),
    cv,
  };
  await api.guardarCvOferta(o.id, registro);
  return { id: o.id, ...registro };
}

const CLAVE_REVISADO = "devprep.cvAutoRevisado";
const CADA = 3 * 60 * 60 * 1000; // las ofertas se buscan de nuevo cada 3 horas
let enCurso = null;

/**
 * Hace solos los CV de las ofertas con puntaje muy alto (como mucho 2 por día). Se llama al abrir la
 * app; revisa como mucho cada 3 horas. Devuelve los CV que hizo (para que Aksu te avise).
 */
export function cvsAutomaticos() {
  if (ES_VISITA || !claveIa() || !api.cvBase) return Promise.resolve([]);
  if (Date.now() - Number(localStorage.getItem(CLAVE_REVISADO) ?? 0) < CADA) return Promise.resolve([]);
  enCurso ??= (async () => {
    localStorage.setItem(CLAVE_REVISADO, String(Date.now()));
    const [{ umbral }, { ofertas }, cvs] = await Promise.all([api.cvBase(), api.ofertasParaTi(), api.cvsOferta()]);
    recordarOfertas(ofertas);
    const elegidas = ofertasParaCvAuto(ofertas, {
      conCv: cvs.map((c) => c.id),
      hechosHoy: cvs.filter((c) => c.auto && c.fecha === hoy()).length,
      umbral,
    });
    const hechos = [];
    for (const o of elegidas) {
      if (!o.texto || o.texto.length < 40) continue;
      try {
        hechos.push(
          await generarCvOferta({ id: o.id, oferta: `${o.titulo}\n${o.empresa ?? ""}\n${o.texto}`, titulo: o.titulo, empresa: o.empresa, url: o.url, puntaje: o.puntaje, fuente: o.fuente, auto: true }),
        );
      } catch {
        break; // sin IA, sin saldo o tope del mes: se intenta en la próxima revisión
      }
    }
    return hechos;
  })()
    .catch(() => [])
    .finally(() => {
      enCurso = null;
    });
  return enCurso;
}

// ---------- Para Aksu: cómo va tu búsqueda ----------
const CLAVE_OFERTAS = "devprep.busquedaOfertas";

/** Guarda lo justo de la última búsqueda (sin el texto de cada oferta) para el resumen de Aksu. */
export function recordarOfertas(ofertas) {
  const corto = ofertas.slice(0, 80).map(({ id, titulo, empresa, fuente, puntaje, nueva, marca }) => ({ id, titulo, empresa, fuente, puntaje, nueva, marca }));
  localStorage.setItem(CLAVE_OFERTAS, JSON.stringify(corto));
}

/** La búsqueda de trabajo en texto, o "" si todavía no hay nada que contar. Sin pedir nada a internet. */
export async function resumenParaAksu() {
  if (!api.cvsOferta) return "";
  let ofertas = [];
  try {
    ofertas = JSON.parse(localStorage.getItem(CLAVE_OFERTAS) ?? "[]");
  } catch {
    ofertas = [];
  }
  const [cvs, postulaciones] = await Promise.all([api.cvsOferta(), api.postulaciones?.() ?? []]).catch(() => [[], []]);
  if (!ofertas.length && !cvs.length && !postulaciones.length) return "";
  return resumenBusqueda({ ofertas, cvs, postulaciones, hoy: hoy() });
}
