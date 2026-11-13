// Rutas /api/ejercicios. El navegador solo envía un `id`; la ruta de disco
// siempre sale del índice, así nadie puede pedir archivos fuera de content/.
import { Router } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Lo que se manda al navegador de cada ejercicio (sin rutas de disco). */
function resumen(ej, progreso) {
  const p = progreso?.deEjercicio(ej.id);
  return {
    id: ej.id,
    titulo: ej.titulo,
    tipo: ej.tipo,
    tema: ej.tema,
    nivel: ej.nivel,
    tags: ej.tags,
    coleccion: ej.coleccion,
    estado: p?.estado ?? "pendiente",
    ultimoResultado: p?.ultimoResultado ?? null,
  };
}

const leer = (ej, archivo) => readFile(path.join(ej.carpeta, archivo), "utf8");

export function rutasEjercicios({ indice, progreso, workspace, corredor, vscode, eventos }) {
  const router = Router();

  // Busca el ejercicio por id y lo deja en req.ejercicio (o responde 404).
  router.param("id", (req, res, next, id) => {
    const ej = indice.porId.get(id);
    if (!ej) return res.status(404).json({ error: `No existe el ejercicio "${id}"` });
    req.ejercicio = ej;
    next();
  });

  router.get("/", (req, res) => {
    res.json(indice.ejercicios.map((ej) => resumen(ej, progreso)));
  });

  router.get("/:id", async (req, res) => {
    const ej = req.ejercicio;
    const pistas = JSON.parse(await leer(ej, "pistas.json").catch(() => "[]"));
    res.json({
      ...resumen(ej, progreso),
      enunciado: await leer(ej, "enunciado.md"),
      archivo: ej.archivos.solucion,
      totalPistas: pistas.length,
      preparado: workspace ? await workspace.existe(ej) : false,
      corriendo: corredor?.estaCorriendo(ej.id) ?? false,
      progreso: progreso?.deEjercicio(ej.id) ?? null,
    });
  });

  return router;
}
