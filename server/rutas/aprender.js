// Rutas de Aprender (/api/aprender) y Referencia (/api/referencia).
import { Router } from "express";
import { fechaLocal } from "../fechas.js";
import { estadoVisible } from "../progreso-reglas.js";

export function rutasAprender({ aprender, referencia, indice, progreso }) {
  const router = Router();

  const estadoDe = (id) => {
    const r = progreso.datos().ejercicios[id];
    return r ? estadoVisible(r, fechaLocal()) : "pendiente";
  };

  /** Resumen de un tema con tu avance. */
  function resumenTema(t) {
    const quiz = progreso.datos().quizzes[t.id] ?? null;
    return {
      id: t.id,
      titulo: t.titulo,
      area: t.area,
      orden: t.orden,
      descripcion: t.descripcion,
      totalEjercicios: t.ejercicios.length,
      resueltos: t.ejercicios.filter((id) => estadoDe(id) === "resuelto").length,
      quiz: quiz && { mejor: quiz.mejor, total: quiz.total },
      preguntasQuiz: t.quiz.length,
    };
  }

  router.get("/aprender", (req, res) => {
    res.json(aprender.temas.map(resumenTema));
  });

  router.get("/aprender/:id", (req, res) => {
    const tema = aprender.porId.get(req.params.id);
    if (!tema) return res.status(404).json({ error: "No existe ese tema." });
    // Anterior y siguiente dentro de la misma área (JavaScript o React).
    const delArea = aprender.temas.filter((t) => t.area === tema.area);
    const orden = delArea.indexOf(tema);
    res.json({
      ...resumenTema(tema),
      teoria: tema.teoria,
      quiz: tema.quiz,
      ejercicios: tema.ejercicios
        .map((id) => indice.porId.get(id))
        .filter(Boolean)
        .map((ej) => ({ id: ej.id, titulo: ej.titulo, nivel: ej.nivel, tema: ej.tema, estado: estadoDe(ej.id) })),
      anterior: delArea[orden - 1] ? { id: delArea[orden - 1].id, titulo: delArea[orden - 1].titulo } : null,
      siguiente: delArea[orden + 1] ? { id: delArea[orden + 1].id, titulo: delArea[orden + 1].titulo } : null,
    });
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
