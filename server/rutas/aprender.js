// Rutas de Aprender (/api/aprender) y Referencia (/api/referencia).
import { Router } from "express";
import { fechaLocal } from "../fechas.js";
import { detalleTema, resumenTema } from "../vistas-aprender.js";

export function rutasAprender({ aprender, referencia, indice, progreso }) {
  const router = Router();

  /** Tu progreso de hoy, en la forma que esperan las vistas. */
  const miProgreso = () => {
    const datos = progreso.datos();
    return { registros: datos.ejercicios, quizzes: datos.quizzes, hoy: fechaLocal() };
  };

  router.get("/aprender", (req, res) => {
    const p = miProgreso();
    res.json(aprender.temas.map((t) => resumenTema(t, p)));
  });

  router.get("/aprender/:id", (req, res) => {
    const tema = detalleTema(aprender, req.params.id, indice, miProgreso());
    if (!tema) return res.status(404).json({ error: "No existe ese tema." });
    res.json(tema);
  });

  router.post("/aprender/:id/quiz", async (req, res) => {
    const tema = aprender.porId.get(req.params.id);
    if (!tema) return res.status(404).json({ error: "No existe ese tema." });
    const aciertos = Number(req.body?.aciertos);
    if (!Number.isInteger(aciertos) || aciertos < 0 || aciertos > tema.quiz.length) {
      return res.status(400).json({ error: "Número de aciertos inválido." });
    }
    res.json(await progreso.guardarQuiz(tema.id, aciertos, tema.quiz.length));
  });

  router.get("/referencia", (req, res) => {
    res.json({ categorias: referencia.categorias, entradas: referencia.entradas });
  });

  return router;
}
