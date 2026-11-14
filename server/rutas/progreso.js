// Rutas de Inicio, Progreso y Ajustes: /api/inicio, /api/progreso, /api/config
import { Router } from "express";
import { fechaLocal } from "../fechas.js";
import { fraseDelDia } from "../frases.js";
import { calendario, preparacion, repasosDeHoy, resumenDias, ritmo, semana } from "../metricas.js";

export function rutasProgreso({ indice, progreso }) {
  const router = Router();

  /** Calcula todo lo que comparten Inicio y Progreso. */
  async function estadoGeneral() {
    const hoy = fechaLocal();
    const datos = progreso.datos();
    const config = datos.config;
    const registros = datos.ejercicios;
    const prep = preparacion(indice.ejercicios, registros, hoy);
    await progreso.anotarPreparacion(prep.total);
    const resueltos = indice.ejercicios.filter((ej) => registros[ej.id]?.estado === "resuelto").length;
    return {
      hoy,
      config,
      registros,
      prep,
      resueltos,
      dias: resumenDias(datos.dias, config, hoy),
      ritmo: ritmo({ fechaMeta: config.fechaMeta, hoy, totalEjercicios: indice.ejercicios.length, resueltos, dias: datos.dias }),
      semana: semana(datos.dias, hoy, prep.total),
    };
  }

  const resumenCorto = (ej) => ({ id: ej.id, titulo: ej.titulo, tema: ej.tema, nivel: ej.nivel });

  router.get("/inicio", async (req, res) => {
    const g = await estadoGeneral();

    // "Continuar": el ejercicio en progreso que tocaste por última vez.
    const enProgreso = indice.ejercicios
      .filter((ej) => g.registros[ej.id]?.estado === "en-progreso")
      .sort((a, b) => (g.registros[b.id].ultimaActividad ?? "").localeCompare(g.registros[a.id].ultimaActividad ?? ""));
    // "Siguiente": el primer pendiente, en el orden del contenido.
    const pendientes = indice.ejercicios.filter((ej) => !g.registros[ej.id] || g.registros[ej.id].estado === "pendiente");
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

    res.json({
      config: g.config,
      hoy: g.hoy,
      meta: g.dias.hoy,
      ayer: g.dias.ayer,
      racha: g.dias.racha,
      preparacion: g.prep.total,
      ritmo: g.ritmo,
      semana: g.semana,
      totales: { resueltos: g.resueltos, total: indice.ejercicios.length },
      repasos: repasosDeHoy(indice.ejercicios, g.registros, g.hoy).map(resumenCorto),
      continuar: enProgreso[0] ? resumenCorto(enProgreso[0]) : null,
      siguiente: siguiente ? resumenCorto(siguiente) : null,
      sugeridos: sugeridos.map(resumenCorto),
      frase: fraseDelDia(g.hoy),
    });
  });

  router.get("/progreso", async (req, res) => {
    const g = await estadoGeneral();
    res.json({
      config: g.config,
      preparacion: g.prep,
      racha: g.dias.racha,
      meta: g.dias.hoy,
      ritmo: g.ritmo,
      semana: g.semana,
      totales: { resueltos: g.resueltos, total: indice.ejercicios.length },
      calendario: calendario(progreso.datos().dias, g.hoy),
    });
  });

  router.get("/config", (req, res) => res.json(progreso.config()));

  router.put("/config", async (req, res) => {
    res.json(await progreso.cambiarConfig(req.body));
  });

  return router;
}
