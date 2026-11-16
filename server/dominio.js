// Mapa de lo que dominas: por cada unidad (los temas de Aprender más Algoritmos), cuánto la dominas
// de verdad combinando ejercicios resueltos, el quiz del tema y los ítems de lección en caja 3 o más.
import { dominio } from "./metricas.js";
import { unidadDeEjercicio } from "../scripts/items/unidades.js";

/** Cuánto pesa cada parte (si una unidad no tiene alguna, su peso se reparte entre las otras). */
export const PESOS_DOMINIO = { ejercicios: 0.5, items: 0.3, quiz: 0.2 };

/** Color del mapa según el valor (0 a 1) y si ya empezaste. */
export function estadoDominio(valor, empezada) {
  if (!empezada) return "sin-empezar";
  if (valor >= 0.75) return "verde";
  if (valor >= 0.4) return "amarillo";
  return "rojo";
}

/**
 * @param {object} p
 * @param {{ id: string, titulo: string, area: string, conTeoria?: boolean }[]} p.unidades
 * @param {object[]} p.ejercicios       resumen de ejercicios ({ id, tema, coleccion })
 * @param {object[]} p.temas            temas de Aprender (con `ejercicios`)
 * @param {object} p.registros          progreso por ejercicio
 * @param {object} p.quizzes            mejor resultado de cada quiz
 * @param {{ clave: string, unidad: string }[]} p.items  ítems de lección
 * @param {object} p.registrosItems     progreso por ítem
 * @param {string} p.hoy
 */
export function mapaDominio({ unidades, ejercicios, temas, registros = {}, quizzes = {}, items = [], registrosItems = {}, hoy }) {
  const ejPorUnidad = new Map();
  for (const ej of ejercicios) {
    const u = unidadDeEjercicio(ej, temas);
    if (!u) continue;
    if (!ejPorUnidad.has(u)) ejPorUnidad.set(u, []);
    ejPorUnidad.get(u).push(ej);
  }
  const itemsPorUnidad = new Map();
  for (const it of items) {
    if (!itemsPorUnidad.has(it.unidad)) itemsPorUnidad.set(it.unidad, []);
    itemsPorUnidad.get(it.unidad).push(it);
  }

  return unidades.map((u) => {
    const partes = [];
    const falta = [];
    let empezada = false;

    const ejs = ejPorUnidad.get(u.id) ?? [];
    if (ejs.length) {
      const valor = ejs.reduce((s, ej) => s + dominio(registros[ej.id], hoy), 0) / ejs.length;
      const resueltos = ejs.filter((ej) => registros[ej.id]?.estado === "resuelto").length;
      if (ejs.some((ej) => registros[ej.id]?.estado && registros[ej.id].estado !== "pendiente")) empezada = true;
      partes.push({ peso: PESOS_DOMINIO.ejercicios, valor });
      if (resueltos < ejs.length) falta.push(`${ejs.length - resueltos} de ${ejs.length} ejercicios por resolver`);
    }

    const its = itemsPorUnidad.get(u.id) ?? [];
    if (its.length) {
      const dominados = its.filter((it) => (registrosItems[it.clave]?.caja ?? 0) >= 3).length;
      if (its.some((it) => registrosItems[it.clave])) empezada = true;
      partes.push({ peso: PESOS_DOMINIO.items, valor: dominados / its.length });
      if (dominados / its.length < 0.8) falta.push(`${its.length - dominados} preguntas de lección por dominar`);
    }

    const tema = temas.find((t) => t.id === u.id);
    if (tema?.quiz?.length || u.conTeoria) {
      const q = quizzes[u.id];
      const total = q?.total ?? tema?.quiz?.length ?? 0;
      if (q) empezada = true;
      if (total) {
        const valor = q ? (q.mejor ?? 0) / q.total : 0;
        partes.push({ peso: PESOS_DOMINIO.quiz, valor });
        if (valor < 0.8) falta.push(q ? `el quiz (tu mejor: ${q.mejor}/${q.total})` : "hacer el quiz");
      }
    }

    const pesoTotal = partes.reduce((s, p) => s + p.peso, 0);
    const valor = pesoTotal ? partes.reduce((s, p) => s + p.peso * p.valor, 0) / pesoTotal : 0;
    return { id: u.id, titulo: u.titulo, area: u.area, valor: Math.round(valor * 100) / 100, estado: estadoDominio(valor, empezada), falta };
  });
}

/** Las unidades más flojas entre las que ya empezaste (para el "Entrenamiento de hoy"). */
export function unidadesDebiles(mapa, cuantas = 3) {
  return mapa
    .filter((u) => u.estado === "rojo" || u.estado === "amarillo")
    .sort((a, b) => a.valor - b.valor)
    .slice(0, cuantas);
}
