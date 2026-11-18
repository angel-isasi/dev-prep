// Métricas de la pantalla Inicio y Progreso, como funciones puras.
// "Hecho" en un día = sus puntos de estudio (server/puntos.js): cuenta todo lo que haces, en la
// laptop y en el celular, cada cosa con su peso. La meta, la deuda y la racha se miden en puntos.
import { estadoVisible, sumarDias } from "./progreso-reglas.js";
import { PUNTOS_POR_META, huboEstudio, puntosDe, segundosDe } from "./puntos.js";

/** Lo hecho en un día, en puntos de estudio. */
export const hechoDe = puntosDe;

/** Días entre dos fechas "AAAA-MM-DD" (b - a). */
export function diasEntre(a, b) {
  const [a1, m1, d1] = a.split("-").map(Number);
  const [a2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

/** Día de la semana de una fecha "AAAA-MM-DD": 0 = lunes ... 6 = domingo. */
export function diaSemana(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return (new Date(Date.UTC(a, m - 1, d)).getUTCDay() + 6) % 7;
}

/** Lunes de la semana de una fecha. */
export const lunesDe = (fecha) => sumarDias(fecha, -diaSemana(fecha));

/** "Mi semana": cuánto puedes cada día. Pesos que reparten la meta sin cambiar el total semanal. */
export const PESOS_HORARIO = { libre: 0, poco: 0.5, normal: 1, mucho: 1.5 };
export const DIAS_SEMANA = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

/**
 * Meta de un día, en puntos. El número de Ajustes (`metaDiaria`) son unidades de 25 puntos: con 2,
 * la meta es de 50 puntos. Con horario se reparte por pesos (más el sábado, menos el día de clases
 * largas) sin cambiar el total de la semana, redondeada de 5 en 5.
 */
export function metaDelDia(fecha, metaDiaria, horario) {
  const base = metaDiaria * PUNTOS_POR_META;
  if (!horario) return base;
  const pesos = DIAS_SEMANA.map((d) => PESOS_HORARIO[horario[d]] ?? 1);
  const promedio = pesos.reduce((a, b) => a + b, 0) / 7;
  if (!promedio) return base;
  return Math.round((base * pesos[diaSemana(fecha)]) / promedio / 5) * 5;
}

/** ¿Esa fecha cae en una pausa (semana de exámenes)? */
export const enPausa = (fecha, pausas = []) => pausas.some((p) => p.desde <= fecha && fecha <= p.hasta);

/** Días "salvados" por semana: hiciste algo aunque no llegaste a la meta, y la racha no se rompe. */
export const SALVADOS_POR_SEMANA = 2;

/**
 * Meta del día, deuda y racha. Todo en puntos de estudio.
 * - Deuda: lo que no hiciste un día se suma al siguiente, con tope (`topeDeuda` son unidades de
 *   25 puntos, igual que la meta). Cuenta desde tu primer día.
 * - Racha: días seguidos cumpliendo la meta (termina hoy si ya cumpliste, si no, ayer).
 * - Día salvado: si un día hiciste algo pero no llegaste, la racha no se rompe (máximo 2 por
 *   semana, de lunes a domingo). La deuda igual suma. Hoy se acredita recién al cerrar el día.
 * - Pausa (semana de exámenes): ni suma deuda ni rompe la racha.
 * @param {object} dias
 * @param {{ metaDiaria: number, topeDeuda: number }} config
 * @param {string} hoy
 * @param {{ horario?: object, pausas?: { desde: string, hasta: string }[] }} [extras]
 */
export function resumenDias(dias, { metaDiaria, topeDeuda }, hoy, { horario = null, pausas = [] } = {}) {
  const fechas = Object.keys(dias).filter((f) => huboEstudio(dias[f])).sort();
  const primerDia = fechas[0] ?? hoy;
  const meta = (f) => metaDelDia(f, metaDiaria, horario);
  const tope = topeDeuda * PUNTOS_POR_META;

  // Hacia adelante: deuda y estado de cada día cerrado (cumplió, salvado, pausa o falló)
  let deuda = 0;
  const estado = {};
  const salvadosEnSemana = {};
  for (let f = primerDia; f < hoy; f = sumarDias(f, 1)) {
    if (enPausa(f, pausas)) {
      estado[f] = "pausa";
      continue;
    }
    const hecho = hechoDe(dias[f]);
    const objetivo = meta(f) + deuda;
    deuda = Math.min(tope, Math.max(0, objetivo - hecho));
    const lunes = lunesDe(f);
    if (hecho >= meta(f)) estado[f] = "cumplio";
    else if (hecho > 0 && (salvadosEnSemana[lunes] ?? 0) < SALVADOS_POR_SEMANA) {
      estado[f] = "salvado";
      salvadosEnSemana[lunes] = (salvadosEnSemana[lunes] ?? 0) + 1;
    } else estado[f] = "fallo";
  }

  const pausaHoy = enPausa(hoy, pausas);
  const hechoHoy = hechoDe(dias[hoy]);
  const metaHoy = pausaHoy ? 0 : meta(hoy);
  const objetivoHoy = pausaHoy ? 0 : metaHoy + deuda;
  const cumplioHoy = !pausaHoy && hechoHoy >= metaHoy && metaHoy > 0;

  let racha = 0;
  if (metaDiaria > 0) {
    let f = cumplioHoy ? hoy : sumarDias(hoy, -1);
    if (cumplioHoy) {
      racha++;
      f = sumarDias(f, -1);
    }
    for (; f >= primerDia; f = sumarDias(f, -1)) {
      if (estado[f] === "pausa") continue;
      if (estado[f] === "cumplio" || estado[f] === "salvado") racha++;
      else break;
    }
  }

  const ayer = sumarDias(hoy, -1);
  const usoAyerOAntes = primerDia <= ayer;
  const usadosSemana = salvadosEnSemana[lunesDe(hoy)] ?? 0;

  return {
    hoy: {
      hecho: hechoHoy,
      objetivo: objetivoHoy,
      deuda: pausaHoy ? 0 : deuda,
      cumplio: pausaHoy || hechoHoy >= objetivoHoy,
      meta: metaHoy,
      cumplioMeta: cumplioHoy,
      pausa: pausaHoy,
      // Si terminas hoy con algo hecho pero sin llegar, ¿la racha se salva?
      salvable: !pausaHoy && hechoHoy > 0 && hechoHoy < metaHoy && usadosSemana < SALVADOS_POR_SEMANA,
    },
    racha,
    salvados: { semana: usadosSemana, maximo: SALVADOS_POR_SEMANA },
    estados: estado,
    ayer: usoAyerOAntes ? { hecho: hechoDe(dias[ayer]), meta: enPausa(ayer, pausas) ? 0 : meta(ayer), cumplio: estado[ayer] === "cumplio" || estado[ayer] === "pausa", estado: estado[ayer] ?? null } : null,
  };
}

/** Cuánto pesa cada tema en una entrevista junior (1 = normal). */
export const PESO_TEMA = {
  arrays: 1.3,
  objetos: 1.2,
  strings: 1.1,
  funciones: 1.1,
  closures: 1.2,
  asincronia: 1.3,
  clases: 0.9,
  iteradores: 0.6,
  algoritmos: 1.1,
};
const pesoDe = (tema) => PESO_TEMA[tema] ?? (tema.startsWith("react") ? 1.3 : 1);

/**
 * Qué tan bien dominas un ejercicio, de 0 a 1:
 * resuelto sin ayuda = 1; con 2 pistas = 0.85; con las 3 = 0.6;
 * si se te venció el repaso, baja un 20 %; sin resolver o con la solución vista = 0.
 */
export function dominio(registro, hoy) {
  if (!registro || registro.estado !== "resuelto" || registro.vioSolucion) return 0;
  let valor = registro.pistasVistas >= 3 ? 0.6 : registro.pistasVistas === 2 ? 0.85 : 1;
  if (registro.repaso && registro.repaso.proximo < hoy) valor *= 0.8;
  return valor;
}

/**
 * Preparación para entrevista en % (lo que dominas de verdad, no lo que viste),
 * ponderada por la importancia de cada tema.
 */
export function preparacion(ejercicios, registros, hoy) {
  const porTema = new Map();
  let suma = 0;
  let pesoTotal = 0;

  for (const ej of ejercicios) {
    const d = dominio(registros[ej.id], hoy);
    const peso = pesoDe(ej.tema);
    suma += d * peso;
    pesoTotal += peso;

    const t = porTema.get(ej.tema) ?? { tema: ej.tema, total: 0, resueltos: 0, suma: 0 };
    t.total++;
    if (registros[ej.id]?.estado === "resuelto") t.resueltos++;
    t.suma += d;
    porTema.set(ej.tema, t);
  }

  return {
    total: pesoTotal ? Math.round((suma / pesoTotal) * 1000) / 10 : 0,
    porTema: [...porTema.values()]
      .map(({ suma: s, ...t }) => ({ ...t, porcentaje: Math.round((s / t.total) * 100) }))
      .sort((a, b) => b.total - a.total),
  };
}

/** Días que hacen falta de historia para juzgar si vas atrasado. Antes de eso: "empezando". */
export const DIAS_PARA_RITMO = 3;

/**
 * ¿Llegas a tu fecha meta al ritmo actual? Compara lo que necesitas por día
 * con tu promedio de los últimos 7 días. Si empezaste hace menos de 7 días, el promedio
 * se saca solo con los días que llevas (no se divide entre días en que aún no usabas la app),
 * y los primeros días no hay veredicto: el estado es "empezando".
 */
export function ritmo({ fechaMeta, hoy, totalEjercicios, resueltos, dias }) {
  const diasRestantes = diasEntre(hoy, fechaMeta);
  const pendientes = Math.max(0, totalEjercicios - resueltos);

  const conActividad = Object.keys(dias).filter((f) => huboEstudio(dias[f])).sort();
  const primerDia = conActividad[0] && conActividad[0] <= hoy ? conActividad[0] : hoy;
  const diasHistoria = Math.min(7, diasEntre(primerDia, hoy) + 1);

  let suma = 0;
  for (let i = 0; i < diasHistoria; i++) suma += dias[sumarDias(hoy, -i)]?.resueltos ?? 0;
  const promedio = suma / diasHistoria;
  const necesarioPorDia = diasRestantes > 0 ? pendientes / diasRestantes : pendientes;

  let estado;
  if (pendientes === 0) estado = "terminado";
  else if (diasRestantes <= 0) estado = "vencido";
  else if (promedio >= necesarioPorDia) estado = "al-dia";
  else estado = diasHistoria < DIAS_PARA_RITMO ? "empezando" : "atrasado";

  return {
    diasRestantes,
    pendientes,
    necesarioPorDia: Math.round(necesarioPorDia * 10) / 10,
    promedioSemana: Math.round(promedio * 10) / 10,
    diasHistoria,
    estado,
  };
}

/** Resumen de esta semana (de lunes a hoy) y cuánto subió tu preparación. */
export function semana(dias, hoy, preparacionHoy) {
  const [a, m, d] = hoy.split("-").map(Number);
  const diaSemana = (new Date(a, m - 1, d).getDay() + 6) % 7; // lunes = 0
  const lunes = sumarDias(hoy, -diaSemana);

  let resueltos = 0;
  let repasos = 0;
  let segundos = 0;
  let puntos = 0;
  for (let f = lunes; f <= hoy; f = sumarDias(f, 1)) {
    resueltos += dias[f]?.resueltos ?? 0;
    repasos += dias[f]?.repasos ?? 0;
    segundos += segundosDe(dias[f]);
    puntos += hechoDe(dias[f]);
  }

  // La última foto de preparación antes del lunes (o 0 si no hay).
  const anteriores = Object.keys(dias)
    .filter((f) => f < lunes && typeof dias[f]?.preparacion === "number")
    .sort();
  const antes = anteriores.length ? dias[anteriores.at(-1)].preparacion : 0;

  // Los 7 días de lunes a domingo, para el gráfico de barras de Inicio (los que aún no llegan, futuro: true).
  const porDia = Array.from({ length: 7 }, (_, i) => {
    const fecha = sumarDias(lunes, i);
    return { fecha, hecho: hechoDe(dias[fecha]), minutos: Math.round(segundosDe(dias[fecha]) / 60), futuro: fecha > hoy };
  });

  return {
    desde: lunes,
    resueltos,
    repasos,
    puntos,
    minutos: Math.round(segundos / 60),
    subioPreparacion: Math.round((preparacionHoy - antes) * 10) / 10,
    dias: porDia,
  };
}

/**
 * Calendario tipo GitHub: las últimas `semanas` semanas, con intensidad de 0 a 4 según los puntos
 * del día (1: algo; 2: un ejercicio o su equivalente; 3: tres; 4: cinco o más).
 */
export function calendario(dias, hoy, semanas = 20) {
  const [a, m, d] = hoy.split("-").map(Number);
  const diaSemana = (new Date(a, m - 1, d).getDay() + 6) % 7;
  const inicio = sumarDias(hoy, -diaSemana - (semanas - 1) * 7);
  const celdas = [];
  for (let f = inicio; f <= hoy; f = sumarDias(f, 1)) {
    const hecho = hechoDe(dias[f]);
    const minutos = Math.round(segundosDe(dias[f]) / 60);
    const unidades = hecho / PUNTOS_POR_META;
    const nivel = unidades >= 5 ? 4 : unidades >= 3 ? 3 : unidades >= 1 ? 2 : huboEstudio(dias[f]) ? 1 : 0;
    celdas.push({ fecha: f, hecho, minutos, nivel });
  }
  return celdas;
}

/** Ejercicios a los que les toca repaso hoy. */
export function repasosDeHoy(ejercicios, registros, hoy) {
  return ejercicios.filter((ej) => registros[ej.id] && estadoVisible(registros[ej.id], hoy) === "repasar");
}
