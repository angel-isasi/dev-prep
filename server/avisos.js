// Cuándo avisar al celular y a la laptop (lo decide la Lambda cada 30 minutos). Funciones puras.
//
// Reglas (máximo 2 avisos al día, nunca en una pausa de exámenes ni en un día "libre" de tu horario):
// - Recordatorio: a tu hora habitual de estudio (o la que elijas), si hoy todavía no hiciste nada.
// - Última llamada: a las 21:00, si tu racha está en riesgo.
// - Sábado: el examen semanal está listo (si no lo hiciste).
// - Domingo a las 20:00: el resumen de tu semana.
// - A las 11:00: ofertas de trabajo nuevas que te convienen (las busca la Lambda; ver ofertas-auto.js).
import { diasCombinados, fusionarDocumento, vivos } from "./combinar.js";
import { DIAS_SEMANA, diaSemana, enPausa, hechoDe, lunesDe, resumenDias } from "./metricas.js";
import { sumarDias } from "./progreso-reglas.js";

export const MAX_AVISOS_DIA = 2;

/** La ruta que abre un aviso: solo rutas internas de dev-prep ("/algo"); cualquier otra cosa abre el inicio. */
export const rutaDeAviso = (url) => (typeof url === "string" && /^\/(?![/\\])/.test(url) ? url.slice(0, 200) : "/");
export const HORA_OFERTAS = 11;
export const ZONA_POR_DEFECTO = "America/Lima";

/** Fecha y hora local en una zona horaria: { fecha: "AAAA-MM-DD", hora: 0-23, minuto }. */
export function horaLocal(fecha, zona = ZONA_POR_DEFECTO) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: zona,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(fecha)
      .map((p) => [p.type, p.value]),
  );
  return { fecha: `${partes.year}-${partes.month}-${partes.day}`, hora: Number(partes.hour), minuto: Number(partes.minute) };
}

/** Un solo documento con lo de todos los dispositivos (para calcular racha, meta y hora habitual). */
export function documentoUnido(documentos) {
  let unido = { version: 1, config: {}, dias: {} };
  for (const { dispositivo, doc } of documentos) unido = fusionarDocumento(unido, doc, dispositivo);
  return unido;
}

/**
 * Tu hora habitual de estudio: la hora en que más actividad registraste en las últimas 3 semanas
 * (las fechas "en" ya vienen con tu hora local). Sin datos suficientes, las 19:00.
 */
export function horaHabitual(doc, hoy) {
  const desde = sumarDias(hoy, -21);
  const conteo = new Array(24).fill(0);
  const fechas = [
    ...Object.values(doc.preguntas ?? {}).map((r) => r.en),
    ...Object.values(doc.items ?? {}).map((r) => r.en),
    ...Object.values(doc.lecturas ?? {}).map((r) => r.en),
    ...Object.values(doc.ejercicios ?? {}).map((r) => r.ultimaActividad),
  ];
  for (const f of fechas) {
    if (typeof f !== "string" || f.slice(0, 10) < desde) continue;
    const h = Number(f.slice(11, 13));
    if (h >= 0 && h < 24) conteo[h]++;
  }
  const total = conteo.reduce((a, b) => a + b, 0);
  if (total < 5) return 19;
  return conteo.indexOf(Math.max(...conteo));
}

/**
 * Qué avisos tocan ahora.
 * @param {object[]} documentos   { dispositivo, doc } de todos los dispositivos
 * @param {Date} ahora
 * @param {{ fecha?: string, enviados?: string[] }} estado  avisos ya enviados hoy (de la tabla)
 * @param {{ ofertasNuevas?: object[] }} extra  ofertas buenas que todavía no te avisé (las busca la Lambda a las 11:00)
 * @returns {{ avisos: { tipo: string, titulo: string, cuerpo: string, url: string }[], estado: object }}
 */
export function decidirAvisos(documentos, ahora, estado = {}, { ofertasNuevas = [] } = {}) {
  const doc = documentoUnido(documentos);
  const ajustes = vivos(doc.ajustes);
  const zona = ajustes.avisos?.zona ?? ZONA_POR_DEFECTO;
  const { fecha: hoy, hora } = horaLocal(ahora, zona);
  const enviados = estado.fecha === hoy ? [...(estado.enviados ?? [])] : [];
  const nuevoEstado = { fecha: hoy, enviados };
  const nada = { avisos: [], estado: nuevoEstado };

  if (ajustes.avisos?.activos === false) return nada;
  const config = { metaDiaria: doc.config?.metaDiaria ?? 2, topeDeuda: doc.config?.topeDeuda ?? 6 };
  const horario = ajustes.horario ?? null;
  const pausas = ajustes.pausas?.lista ?? [];
  if (enPausa(hoy, pausas)) return nada;
  if (horario?.[DIAS_SEMANA[diaSemana(hoy)]] === "libre") return nada;

  const dias = diasCombinados(doc);
  const resumen = resumenDias(dias, config, hoy, { horario, pausas });
  const dia = dias[hoy] ?? {};
  const algoHoy = hechoDe(dia) + (dia.preguntas ?? 0) + (dia.ingles ?? 0) + (dia.lecturas ?? 0) + (dia.quizzes ?? 0) > 0;
  const horaRecordatorio = Number(String(ajustes.avisos?.hora ?? "").slice(0, 2)) || horaHabitual(doc, hoy);

  const candidatos = [];
  if (hora === horaRecordatorio && !algoHoy) {
    candidatos.push({
      tipo: "recordatorio",
      titulo: resumen.racha > 0 ? `Tu racha de ${resumen.racha} ${resumen.racha === 1 ? "día" : "días"} te espera` : "Hoy toca practicar",
      cuerpo: "Una lección de 5 minutos ya cuenta. Empieza por ahí.",
      url: "/",
    });
  }
  if (hora === 21 && !resumen.hoy.cumplioMeta && resumen.racha > 0) {
    const falta = Math.max(1, resumen.hoy.meta - resumen.hoy.hecho);
    candidatos.push({
      tipo: "ultima-llamada",
      titulo: "Última llamada para tu racha",
      cuerpo: resumen.hoy.salvable
        ? "Ya hiciste algo hoy: si lo dejas aquí, la racha se salva. Una cosa más y cumples."
        : `Te ${falta === 1 ? "falta 1" : `faltan ${falta}`} para tu meta. 10 minutos salvan el día.`,
      url: "/leccion?modo=rapida",
    });
  }
  const examenHecho = !!vivos(doc.examenes)[lunesDe(hoy)];
  if (diaSemana(hoy) === 5 && hora === horaRecordatorio && !examenHecho) {
    candidatos.push({
      tipo: "examen",
      titulo: "Tu examen semanal está listo",
      cuerpo: "20 preguntas de lo que viste esta semana. ¿Cuánto sacas?",
      url: "/leccion?modo=examen",
    });
  }
  if (diaSemana(hoy) === 6 && hora === 20) {
    const semana = Array.from({ length: 7 }, (_, i) => dias[sumarDias(lunesDe(hoy), i)] ?? {});
    const suma = (c) => semana.reduce((t, d) => t + (d[c] ?? 0), 0);
    candidatos.push({
      tipo: "resumen",
      titulo: "Tu semana en dev-prep",
      cuerpo: `${suma("resueltos")} ejercicios, ${suma("lecciones") + suma("ingles")} lecciones y ${Math.round(suma("inglesSegundos") / 60 + suma("inmersion"))} min de inglés. Racha: ${resumen.racha}.`,
      url: "/progreso",
    });
  }

  if (hora === HORA_OFERTAS && ofertasNuevas.length) {
    const [mejor] = ofertasNuevas;
    const n = ofertasNuevas.length;
    candidatos.push({
      tipo: "ofertas",
      titulo: n === 1 ? "Una oferta nueva para ti" : `${n} ofertas nuevas para ti`,
      cuerpo: `${mejor.titulo}${mejor.empresa ? ` en ${mejor.empresa}` : ""} (${mejor.puntaje}/100). Mira por qué te conviene.`,
      url: "/trabajo",
    });
  }

  const avisos = [];
  for (const a of candidatos) {
    if (enviados.includes(a.tipo) || enviados.length >= MAX_AVISOS_DIA) continue;
    enviados.push(a.tipo);
    avisos.push(a);
  }
  return { avisos, estado: nuevoEstado };
}
