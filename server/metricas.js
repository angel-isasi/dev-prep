// Métricas de la pantalla Inicio y Progreso, como funciones puras.
// "Hecho" en un día = ejercicios resueltos + repasos completados.
import { estadoVisible, sumarDias } from "./progreso-reglas.js";

const hechoDe = (dia) => (dia?.resueltos ?? 0) + (dia?.repasos ?? 0);

/** Días entre dos fechas "AAAA-MM-DD" (b - a). */
export function diasEntre(a, b) {
  const [a1, m1, d1] = a.split("-").map(Number);
  const [a2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

/**
 * Meta del día, deuda y racha.
 * - Deuda: lo que no hiciste un día se suma al siguiente, con tope. Cuenta desde tu primer día.
 * - Racha: días seguidos cumpliendo la meta diaria (termina hoy si ya cumpliste, si no, ayer).
 */
export function resumenDias(dias, { metaDiaria, topeDeuda }, hoy) {
  const fechas = Object.keys(dias).filter((f) => hechoDe(dias[f]) > 0 || dias[f]?.segundos > 0).sort();
  const primerDia = fechas[0] ?? hoy;

  let deuda = 0;
  for (let f = primerDia; f < hoy; f = sumarDias(f, 1)) {
    const objetivo = metaDiaria + deuda;
    deuda = Math.min(topeDeuda, Math.max(0, objetivo - hechoDe(dias[f])));
  }

  const hechoHoy = hechoDe(dias[hoy]);
  const objetivoHoy = metaDiaria + deuda;

  let racha = 0;
  let f = hechoHoy >= metaDiaria ? hoy : sumarDias(hoy, -1);
  while (metaDiaria > 0 && hechoDe(dias[f]) >= metaDiaria) {
    racha++;
    f = sumarDias(f, -1);
  }

  const ayer = sumarDias(hoy, -1);
  const usoAyerOAntes = primerDia <= ayer;

  return {
    hoy: { hecho: hechoHoy, objetivo: objetivoHoy, deuda, cumplio: hechoHoy >= objetivoHoy },
    racha,
    ayer: usoAyerOAntes ? { hecho: hechoDe(dias[ayer]), cumplio: hechoDe(dias[ayer]) >= metaDiaria } : null,
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

  const conActividad = Object.keys(dias).filter((f) => hechoDe(dias[f]) > 0 || dias[f]?.segundos > 0).sort();
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
  for (let f = lunes; f <= hoy; f = sumarDias(f, 1)) {
    resueltos += dias[f]?.resueltos ?? 0;
    repasos += dias[f]?.repasos ?? 0;
    segundos += dias[f]?.segundos ?? 0;
  }

  // La última foto de preparación antes del lunes (o 0 si no hay).
  const anteriores = Object.keys(dias)
    .filter((f) => f < lunes && typeof dias[f]?.preparacion === "number")
    .sort();
  const antes = anteriores.length ? dias[anteriores.at(-1)].preparacion : 0;

  // Los 7 días de lunes a domingo, para el gráfico de barras de Inicio (los que aún no llegan, futuro: true).
  const porDia = Array.from({ length: 7 }, (_, i) => {
    const fecha = sumarDias(lunes, i);
    return { fecha, hecho: hechoDe(dias[fecha]), minutos: Math.round((dias[fecha]?.segundos ?? 0) / 60), futuro: fecha > hoy };
  });

  return {
    desde: lunes,
    resueltos,
    repasos,
    minutos: Math.round(segundos / 60),
    subioPreparacion: Math.round((preparacionHoy - antes) * 10) / 10,
    dias: porDia,
  };
}

/** Calendario tipo GitHub: las últimas `semanas` semanas, con intensidad de 0 a 4. */
export function calendario(dias, hoy, semanas = 20) {
  const [a, m, d] = hoy.split("-").map(Number);
  const diaSemana = (new Date(a, m - 1, d).getDay() + 6) % 7;
  const inicio = sumarDias(hoy, -diaSemana - (semanas - 1) * 7);
  const celdas = [];
  for (let f = inicio; f <= hoy; f = sumarDias(f, 1)) {
    const hecho = hechoDe(dias[f]);
    const minutos = Math.round((dias[f]?.segundos ?? 0) / 60);
    const nivel = hecho >= 5 ? 4 : hecho >= 3 ? 3 : hecho >= 1 ? 2 : minutos > 0 ? 1 : 0;
    celdas.push({ fecha: f, hecho, minutos, nivel });
  }
  return celdas;
}

/** Ejercicios a los que les toca repaso hoy. */
export function repasosDeHoy(ejercicios, registros, hoy) {
  return ejercicios.filter((ej) => registros[ej.id] && estadoVisible(registros[ej.id], hoy) === "repasar");
}
