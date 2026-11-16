// Rutas de Inicio, Progreso y Ajustes: /api/inicio, /api/progreso, /api/config
import { Router } from "express";
import { fechaLocal } from "../fechas.js";
import { preparacion } from "../metricas.js";
import { estadoGeneral, vistaInicio, vistaProgreso } from "../vistas-progreso.js";

export function rutasProgreso({ indice, progreso }) {
  const router = Router();

  /** Calcula todo lo que comparten Inicio y Progreso (con los días de todos los dispositivos). */
  async function general() {
    const hoy = fechaLocal();
    const datos = progreso.datos();
    // Primero la foto del % de preparación de hoy: el resumen de la semana la usa.
    const prep = preparacion(indice.ejercicios, datos.ejercicios, hoy);
    await progreso.anotarPreparacion(prep.total);
    return estadoGeneral({ ejercicios: indice.ejercicios, datos, dias: progreso.dias(), hoy, prep });
  }

  router.get("/inicio", async (req, res) => {
    res.json(vistaInicio(await general(), indice.ejercicios));
  });

  router.get("/progreso", async (req, res) => {
    res.json(vistaProgreso(await general(), indice.ejercicios, progreso.dias()));
  });

  router.get("/config", (req, res) => res.json(progreso.config()));

  router.put("/config", async (req, res) => {
    res.json(await progreso.cambiarConfig(req.body));
  });

  return router;
}
