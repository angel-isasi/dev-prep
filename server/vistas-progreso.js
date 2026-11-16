// Vistas de Inicio y Progreso como funciones puras: arman las respuestas de /api/inicio y
// /api/progreso a partir de los ejercicios y tu progreso. Las usan las rutas del servidor y la
// versión publicada (que en pantalla grande muestra el mismo Inicio y Progreso que la laptop).
import { fraseDelDia } from "./frases.js";
import { calendario, preparacion, repasosDeHoy, resumenDias, ritmo, semana } from "./metricas.js";
import { estadoJuego, estudioContraJuego, jefeDeLaSemana } from "./juego.js";
import { vivos } from "./combinar.js";

/** Ajustes que cambian los cálculos (horario, pausas, juego), sin su fecha. */
function ajustesDe(datos) {
  const a = vivos(datos.ajustes);
  const sinFecha = (r) => (r ? Object.fromEntries(Object.entries(r).filter(([k]) => k !== "en")) : null);
  return { horario: sinFecha(a.horario), pausas: a.pausas?.lista ?? [], juego: sinFecha(a.juego) ?? {} };
}

/**
 * "Proyección honesta": si sigues con el ritmo de esta semana, con cuánta preparación llegas a tu fecha meta.
 * Supone que cada ejercicio nuevo sube la preparación lo mismo que en promedio los que ya resolviste.
 */
export function proyeccion({ prep, resueltos, totalEjercicios, ritmo: r }) {
  const porEjercicio = resueltos > 0 ? prep / resueltos : 100 / Math.max(1, totalEjercicios);
  const masResueltos = Math.min(r.pendientes, r.promedioSemana * Math.max(0, r.diasRestantes));
  return { preparacion: Math.min(100, Math.round(prep + porEjercicio * masResueltos)), ejerciciosMas: Math.round(masResueltos) };
}

const resumenCorto = (ej) => ({ id: ej.id, titulo: ej.titulo, tema: ej.tema, nivel: ej.nivel });

/**
 * Lo que comparten Inicio y Progreso.
 * @param {{ ejercicios: object[], datos: object, dias: object, hoy: string, prep?: object }} p
 *   datos: el progreso (config y ejercicios); dias: los días de todos los dispositivos sumados.
 */
export function estadoGeneral({ ejercicios, datos, dias, hoy, prep }) {
  const config = datos.config;
  const registros = datos.ejercicios ?? {};
  const prepCalculada = prep ?? preparacion(ejercicios, registros, hoy);
  const resueltos = ejercicios.filter((ej) => registros[ej.id]?.estado === "resuelto").length;
  const ajustes = ajustesDe(datos);
  return {
    hoy,
    config,
    registros,
    prep: prepCalculada,
    resueltos,
    ajustes,
    dias: resumenDias(dias, config, hoy, ajustes),
    ritmo: ritmo({ fechaMeta: config.fechaMeta, hoy, totalEjercicios: ejercicios.length, resueltos, dias }),
    semana: semana(dias, hoy, prepCalculada.total),
    juego: estadoJuego(dias, config, hoy, { horario: ajustes.horario, tope: ajustes.juego.tope }),
    jefe: jefeDeLaSemana(ejercicios, registros, hoy),
  };
}

/** Respuesta de /api/inicio. */
export function vistaInicio(g, ejercicios) {
  // "Continuar": el ejercicio en progreso que tocaste por última vez.
  const enProgreso = ejercicios
    .filter((ej) => g.registros[ej.id]?.estado === "en-progreso")
    .sort((a, b) => (g.registros[b.id].ultimaActividad ?? "").localeCompare(g.registros[a.id].ultimaActividad ?? ""));
  // "Siguiente": el primer pendiente, en el orden del contenido.
  const pendientes = ejercicios.filter((ej) => !g.registros[ej.id] || g.registros[ej.id].estado === "pendiente");
  const siguiente = pendientes[0];
  // "Sugeridos": hasta 3 pendientes más, cada uno de un tema distinto, para variar.
  const principal = enProgreso[0] ?? siguiente;
  const temasVistos = new Set(principal ? [principal.tema] : []);
  const sugeridos = [];
  for (const ej of pendientes) {
    if (sugeridos.length === 3) break;
    if (ej.id === principal?.id || temasVistos.has(ej.tema)) continue;
    temasVistos.add(ej.tema);
    sugeridos.push(ej);
  }

  return {
    config: g.config,
    hoy: g.hoy,
    meta: g.dias.hoy,
    ayer: g.dias.ayer,
    racha: g.dias.racha,
    preparacion: g.prep.total,
    ritmo: g.ritmo,
    semana: g.semana,
    totales: { resueltos: g.resueltos, total: ejercicios.length },
    repasos: repasosDeHoy(ejercicios, g.registros, g.hoy).map(resumenCorto),
    continuar: enProgreso[0] ? resumenCorto(enProgreso[0]) : null,
    siguiente: siguiente ? resumenCorto(siguiente) : null,
    sugeridos: sugeridos.map(resumenCorto),
    frase: fraseDelDia(g.hoy),
    juego: g.juego,
    salvados: g.dias.salvados,
    jefe: g.jefe ? { ...resumenCorto(g.jefe), coleccion: g.jefe.coleccion } : null,
  };
}

/** Respuesta de /api/progreso. */
export function vistaProgreso(g, ejercicios, dias) {
  return {
    config: g.config,
    preparacion: g.prep,
    racha: g.dias.racha,
    meta: g.dias.hoy,
    ritmo: g.ritmo,
    semana: g.semana,
    totales: { resueltos: g.resueltos, total: ejercicios.length },
    calendario: calendario(dias, g.hoy),
    estudioJuego: estudioContraJuego(dias, g.hoy),
    proyeccion: proyeccion({ prep: g.prep.total, resueltos: g.resueltos, totalEjercicios: ejercicios.length, ritmo: g.ritmo }),
  };
}
