// Rutas de Entrevistas: tarjetas, autoevaluación, guías y tus respuestas.
import { Router } from "express";
import { fechaLocal } from "../fechas.js";
import { ejerciciosEntrevista, resumenEntrevistas, tarjetas } from "../vistas-entrevistas.js";

const NOTAS = ["sabia", "dude", "no"];

export function rutasEntrevistas({ entrevistas, progreso, misRespuestas, indice }) {
  const router = Router();

  router.get("/entrevistas", (req, res) => {
    res.json(resumenEntrevistas(entrevistas, progreso.datos().preguntas, fechaLocal()));
  });

  // ?categoria=CSS  o  ?modo=repaso (las que tocan hoy)  o  ?modo=nuevas
  router.get("/entrevistas/tarjetas", (req, res) => {
    const { categoria, modo } = req.query;
    res.json(tarjetas(entrevistas, progreso.datos().preguntas, fechaLocal(), { categoria, modo }));
  });

  router.post("/entrevistas/preguntas/:id/calificar", async (req, res) => {
    const pregunta = entrevistas.porId.get(req.params.id);
    if (!pregunta) return res.status(404).json({ error: "No existe esa pregunta." });
    const nota = req.body?.nota;
    if (!NOTAS.includes(nota)) return res.status(400).json({ error: "La nota debe ser sabia, dude o no." });
    res.json(await progreso.calificarPregunta(pregunta.id, nota));
  });

  // Ejercicios para practicar con tiempo: retos de algoritmos y de JS intermedios.
  router.get("/entrevistas/ejercicios", (req, res) => {
    res.json(ejerciciosEntrevista(indice.ejercicios, progreso.datos().ejercicios));
  });

  router.get("/mis-respuestas", (req, res) => res.json(misRespuestas.leer()));

  router.put("/mis-respuestas", async (req, res) => {
    res.json(await misRespuestas.guardar(req.body));
  });

  return router;
}
