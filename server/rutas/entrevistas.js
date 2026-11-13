// Rutas de Entrevistas: tarjetas, autoevaluación, guías y tus respuestas.
import { Router } from "express";
import { fechaLocal } from "../fechas.js";
import { preguntaPendiente } from "../progreso-reglas.js";

const NOTAS = ["sabia", "dude", "no"];

export function rutasEntrevistas({ entrevistas, progreso, misRespuestas, indice }) {
  const router = Router();

  /** Una pregunta con su progreso. */
  const conProgreso = (p) => ({ ...p, progreso: progreso.dePregunta(p.id) ?? null });

  router.get("/entrevistas", (req, res) => {
    const hoy = fechaLocal();
    const categorias = entrevistas.categorias.map((c) => {
      const deCategoria = entrevistas.preguntas.filter((p) => p.categoria === c.nombre);
      return {
        ...c,
        vistas: deCategoria.filter((p) => progreso.dePregunta(p.id)).length,
        dominadas: deCategoria.filter((p) => (progreso.dePregunta(p.id)?.caja ?? 0) >= 3).length,
        pendientes: deCategoria.filter((p) => preguntaPendiente(progreso.dePregunta(p.id), hoy)).length,
      };
    });
    res.json({
      categorias,
      total: entrevistas.preguntas.length,
      pendientesHoy: entrevistas.preguntas.filter((p) => preguntaPendiente(progreso.dePregunta(p.id), hoy)).length,
      guias: entrevistas.guias,
    });
  });

  // ?categoria=CSS  o  ?modo=repaso (las que tocan hoy)  o  ?modo=nuevas
  router.get("/entrevistas/tarjetas", (req, res) => {
    const hoy = fechaLocal();
    let lista = entrevistas.preguntas;
    if (req.query.categoria) lista = lista.filter((p) => p.categoria === req.query.categoria);
    if (req.query.modo === "repaso") lista = lista.filter((p) => preguntaPendiente(progreso.dePregunta(p.id), hoy));
    if (req.query.modo === "nuevas") lista = lista.filter((p) => !progreso.dePregunta(p.id));
    // Primero las que tocan repaso, luego las nunca vistas, luego el resto.
    const prioridad = (p) => {
      const r = progreso.dePregunta(p.id);
      return preguntaPendiente(r, hoy) ? 0 : !r ? 1 : 2;
    };
    res.json([...lista].sort((a, b) => prioridad(a) - prioridad(b)).map(conProgreso));
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
    const registros = progreso.datos().ejercicios;
    const lista = indice.ejercicios
      .filter((ej) => ej.coleccion.endsWith("retos") || ej.nivel >= 2)
      .map((ej) => ({
        id: ej.id,
        titulo: ej.titulo,
        tema: ej.tema,
        nivel: ej.nivel,
        coleccion: ej.coleccion,
        estado: registros[ej.id]?.estado ?? "pendiente",
      }));
    res.json(lista);
  });

  router.get("/mis-respuestas", (req, res) => res.json(misRespuestas.leer()));

  router.put("/mis-respuestas", async (req, res) => {
    res.json(await misRespuestas.guardar(req.body));
  });

  return router;
}
