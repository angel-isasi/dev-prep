// Modo visita: para quien entra a ver el proyecto (un reclutador, otro desarrollador) y no a
// estudiar. Muestra la app llena con un progreso de ejemplo en vez de una app en cero.
//
// Se activa con ?visita=1 en la dirección y dura lo que dure la pestaña (sessionStorage).
// Tres garantías:
//   1. El progreso de ejemplo vive en memoria: no lee ni escribe el progreso real del navegador.
//   2. No sincroniza: nunca llama a la nube ni al motor de la laptop (ver sync-movil.js y
//      conexion-local.js, que preguntan ES_VISITA antes de hacer nada).
//   3. Al salir (o al cerrar la pestaña) no queda nada guardado.
import { progresoVacio, sumarDias } from "../../../server/progreso-reglas.js";

const CLAVE = "devprep-visita";

// Se decide una sola vez, al cargar la página, antes de crear el almacén de progreso
function leerModo() {
  try {
    const pedido = new URLSearchParams(location.search).get("visita");
    if (pedido === "1") sessionStorage.setItem(CLAVE, "1");
    if (pedido === "0") sessionStorage.removeItem(CLAVE);
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false; // sin sessionStorage (o fuera del navegador, en los tests) no hay modo visita
  }
}

/** ¿Esta pestaña está en modo visita? */
export const ES_VISITA = leerModo();

/** Vuelve a la app normal, con el progreso real de este navegador. */
export function salirDeVisita() {
  sessionStorage.removeItem(CLAVE);
  location.assign("/");
}

/** Un almacén con la forma de localStorage que solo vive en memoria. */
export function crearAlmacenMemoria() {
  const datos = new Map();
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => void datos.set(clave, String(valor)),
    removeItem: (clave) => void datos.delete(clave),
  };
}

/**
 * Arma un progreso de ejemplo creíble: unas cinco semanas de estudio constante, las primeras
 * unidades dominadas o a medias (va al día con su ruta), repasos que vencen hoy y una racha en curso. Es una función
 * pura y sin azar: con los mismos datos devuelve siempre lo mismo.
 * @param {object} p
 * @param {string} p.hoy
 * @param {{ id: string, coleccion: string }[]} p.ejercicios  índice de ejercicios, en orden
 * @param {{ id: string }[]} p.unidades  unidades de las lecciones, en orden
 * @param {{ clave: string, unidad: string }[]} p.items  ítems de lección
 * @param {{ id: string }[]} p.preguntas  preguntas de entrevista
 * @param {{ id: string, quiz?: unknown[] }[]} p.temas  temas de Aprender
 */
export function progresoDeEjemplo({ hoy, ejercicios = [], unidades = [], items = [], preguntas = [], temas = [] }) {
  const p = {
    ...progresoVacio(),
    lecturas: {},
    misRespuestas: {
      pitch: "Soy estudiante de Ingeniería de Sistemas y me preparo para mi primer puesto como desarrollador frontend. Construí dev-prep, la app que estás viendo, para practicar todos los días.",
      historias: [],
      respuestas: {},
    },
    items: {},
    reportados: {},
    lecciones: { xp: 2340, completadas: 31, ultima: hoy },
    unidadActual: unidades[14]?.id ?? unidades[0]?.id ?? null,
    leccionEnCurso: null,
  };
  p.config = { ...p.config, nombre: "Angel", objetivo: "Conseguir mi primer trabajo como desarrollador frontend junior.", metaDiaria: 2, topeDeuda: 6, fechaMeta: sumarDias(hoy, 70) };
  const en = (dias) => `${sumarDias(hoy, -dias)}T19:30:00-05:00`;

  // Cinco semanas de actividad. Los últimos 9 días cumplen la meta (racha); antes hay huecos.
  for (let hace = 35; hace >= 1; hace--) {
    if (hace > 9 && hace % 6 === 0) continue; // un día libre cada tanto
    const fuerte = hace <= 9 || hace % 3 !== 0;
    p.dias[sumarDias(hoy, -hace)] = {
      resueltos: fuerte ? 1 + (hace % 4 === 0 ? 1 : 0) : 0,
      limpios: fuerte && hace % 2 === 0 ? 1 : 0,
      repasos: hace % 5 === 0 ? 1 : 0,
      lecciones: 1 + (hace % 2),
      ingles: 1 + (hace % 3 === 0 ? 1 : 0),
      preguntas: hace % 4 === 0 ? 10 : 3,
      quizzes: hace % 7 === 0 ? 1 : 0,
      segundos: fuerte ? 1500 + hace * 40 : 300,
      leccionesSegundos: 240 + (hace % 2) * 200,
      inglesSegundos: 500 + (hace % 3) * 150,
      inglesXp: 60 + (hace % 5) * 15,
    };
  }
  // Hoy va a medias: ya hubo una lección y algo de inglés, falta el resto de la sesión
  p.dias[hoy] = { lecciones: 1, ingles: 1, leccionesSegundos: 190, inglesSegundos: 420, inglesXp: 55, preguntas: 2 };

  // Ejercicios de JavaScript: los primeros resueltos (tres con repaso para hoy) y dos a medias
  const deJs = ejercicios.filter((e) => e.coleccion === "javascript/guiados" || e.coleccion === "javascript/ejercicios");
  deJs.slice(0, 44).forEach((e, i) => {
    const dias = 30 - Math.floor(i / 1.6);
    p.ejercicios[e.id] = {
      estado: "resuelto",
      iniciadoEn: en(dias),
      resueltoEn: en(dias),
      intentos: 1 + (i % 3),
      ultimoResultado: null,
      pistasVistas: i % 5 === 0 ? 2 : 0,
      vioSolucion: false,
      segundosActivos: 600 + (i % 7) * 180,
      explicacion: "",
      repaso: { caja: 2 + (i % 3), proximo: sumarDias(hoy, i < 3 ? 0 : 2 + (i % 9)) },
      ultimaActividad: en(dias),
      comparoSolucion: false,
      repasando: false,
    };
  });
  deJs.slice(44, 46).forEach((e, i) => {
    p.ejercicios[e.id] = { estado: "en-progreso", iniciadoEn: en(1), resueltoEn: null, intentos: 2 + i, ultimoResultado: null, pistasVistas: 1, vioSolucion: false, segundosActivos: 420, explicacion: "", repaso: null, ultimaActividad: en(i), comparoSolucion: false, repasando: false };
  });

  // Lecciones: las catorce primeras unidades fijadas (va al día con su ruta); las dos siguientes a medias, con repasos para hoy
  const orden = new Map(unidades.map((u, i) => [u.id, i]));
  let enCurso = 0;
  for (const it of items) {
    const n = orden.get(it.unidad);
    if (n === undefined || n > 15) continue;
    if (n <= 13) p.items[it.clave] = { caja: 3 + (it.clave.length % 2), proximo: sumarDias(hoy, 3 + (it.clave.length % 11)), ultima: "sabia", vistas: 3 };
    else if (enCurso++ % 3 !== 2) p.items[it.clave] = { caja: 1 + (enCurso % 2), proximo: sumarDias(hoy, enCurso % 4 === 0 ? 0 : 1 + (enCurso % 3)), ultima: enCurso % 9 === 0 ? "no" : "sabia", vistas: 1 + (enCurso % 2) };
  }

  // Quiz de los primeros temas y tarjetas de entrevista, algunas para repasar hoy
  temas.slice(0, 14).forEach((t, i) => {
    const total = t.quiz?.length ?? 6;
    p.quizzes[t.id] = { mejor: Math.max(1, total - (i % 3)), total, ultimo: Math.max(1, total - (i % 3)), en: en(Math.max(1, 30 - i * 2)) };
  });
  preguntas.slice(0, 36).forEach((q, i) => {
    p.preguntas[q.id] = { caja: 1 + (i % 4), proximo: sumarDias(hoy, i % 6 === 0 ? 0 : 1 + (i % 8)), ultima: i % 7 === 0 ? "dude" : "sabia", vistas: 1 + (i % 3) };
  });

  return p;
}
