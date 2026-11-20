// Rutas /api/ejercicios. El navegador solo envía un `id`; la ruta de disco
// siempre sale del índice, así nadie puede pedir archivos fuera de content/.
import { Router } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { seccionMarkdown } from "../contenido.js";
import { estadoVisible, repasoPendiente, solucionDesbloqueada } from "../progreso-reglas.js";
import { fechaLocal } from "../fechas.js";

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
    patron: ej.patron,
    coleccion: ej.coleccion,
    estado: p ? estadoVisible(p, fechaLocal()) : "pendiente",
    ultimoResultado: p?.ultimoResultado ?? null,
  };
}

const leer = (ej, archivo) => readFile(path.join(ej.carpeta, archivo), "utf8");
const leerPistas = async (ej) => JSON.parse(await leer(ej, "pistas.json").catch(() => "[]"));

/** Solución oficial + explicación completa. */
async function solucionCompleta(ej) {
  return {
    codigo: await leer(ej, ej.archivos.solucion),
    lenguaje: ej.ext,
    explicacion: await leer(ej, "explicacion.md").catch(() => ""),
  };
}

const SECCION_MODELO = "Cómo explicarlo en la entrevista";

/** La explicación modelo para la entrevista (sección de explicacion.md). */
async function modelo(ej) {
  const md = await leer(ej, "explicacion.md").catch(() => "");
  return seccionMarkdown(md, SECCION_MODELO);
}

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
    const pistas = await leerPistas(ej);
    const registro = progreso?.deEjercicio(ej.id);
    const desbloqueada = registro ? solucionDesbloqueada(registro) : false;
    res.json({
      ...resumen(ej, progreso),
      enunciado: await leer(ej, "enunciado.md"),
      archivo: ej.archivos.solucion,
      totalPistas: pistas.length,
      pistas: pistas.slice(0, registro?.pistasVistas ?? 0), // solo las que ya viste
      solucion: desbloqueada ? await solucionCompleta(ej) : null,
      modelo: registro?.estado === "resuelto" ? await modelo(ej) : null,
      preparado: workspace ? await workspace.existe(ej) : false,
      corriendo: corredor?.estaCorriendo(ej.id) ?? false,
      resultado: corredor?.ultimoResultado(ej.id) ?? null,
      progreso: registro ?? null,
      repasoPendiente: registro ? repasoPendiente(registro, fechaLocal()) : false,
    });
  });

  // Empezar un repaso: vuelve al archivo inicial (con respaldo) y lo resuelves de nuevo sin ayuda.
  router.post("/:id/repasar", async (req, res) => {
    const ej = req.ejercicio;
    corredor?.marcarManual(ej.id);
    const { respaldo } = await workspace.reiniciar(ej);
    const registro = await progreso.iniciarRepaso(ej.id);
    res.json({ progreso: registro, respaldo: respaldo && path.relative(workspace.raiz, respaldo) });
  });

  // Ver la pista n (1, 2 o 3), siempre en orden.
  router.post("/:id/pistas/:n", async (req, res) => {
    const ej = req.ejercicio;
    const n = Number(req.params.n);
    const pistas = await leerPistas(ej);
    if (!Number.isInteger(n) || n < 1 || n > pistas.length) {
      return res.status(404).json({ error: "Esa pista no existe." });
    }
    const registro = await progreso.verPista(ej.id, n);
    if (!registro) return res.status(409).json({ error: "Primero mira la pista anterior." });
    res.json({ pistas: pistas.slice(0, registro.pistasVistas), progreso: registro });
  });

  // Ver la solución oficial y su explicación (con penalidad si no estaba resuelto).
  router.post("/:id/solucion", async (req, res) => {
    const ej = req.ejercicio;
    const registro = await progreso.verSolucion(ej.id);
    res.json({ solucion: await solucionCompleta(ej), progreso: registro });
  });

  // "Explícalo con tus palabras": guarda tu texto y devuelve la explicación modelo.
  router.put("/:id/explicacion", async (req, res) => {
    const ej = req.ejercicio;
    const texto = typeof req.body?.texto === "string" ? req.body.texto.slice(0, 5000) : null;
    if (texto === null) return res.status(400).json({ error: "Falta el texto." });
    const registro = await progreso.guardarExplicacion(ej.id, texto);
    res.json({ progreso: registro, modelo: await modelo(ej) });
  });

  // Prepara workspace/<id>/, abre VS Code y corre los tests una primera vez.
  router.post("/:id/abrir", async (req, res) => {
    const ej = req.ejercicio;
    corredor?.marcarManual(ej.id); // copiar archivos puede hacer que Vitest corra solo
    const { creado } = await workspace.preparar(ej);
    await progreso?.marcarAbierto(ej.id);

    let avisoVSCode = null;
    try {
      await vscode(workspace.raiz, workspace.archivoDe(ej));
    } catch (error) {
      avisoVSCode = error.message;
    }

    corredor?.correr(ej);
    res.json({ creado, avisoVSCode });
  });

  // Respalda tu archivo y vuelve al de inicio.
  router.post("/:id/reiniciar", async (req, res) => {
    const ej = req.ejercicio;
    corredor?.marcarManual(ej.id); // Vitest verá el archivo cambiado y correrá solo
    const { respaldo } = await workspace.reiniciar(ej);
    await progreso?.registrarEvento("reiniciar", ej.id);
    res.json({ respaldo: respaldo && path.relative(workspace.raiz, respaldo) });
  });

  // Tu código de workspace/, para que la IA lo revise o lo tenga a la vista al evaluar tu explicación.
  // Solo el archivo de ese ejercicio (la ruta sale del índice, no del pedido).
  router.get("/:id/mi-codigo", async (req, res) => {
    const ej = req.ejercicio;
    if (!workspace || !(await workspace.existe(ej))) return res.json({ codigo: null });
    const codigo = await readFile(workspace.archivoDe(ej), "utf8").catch(() => null);
    // Con el ejercicio resuelto (o la solución ya vista), la IA compara tu código con el oficial
    const registro = progreso?.deEjercicio(ej.id);
    const oficial = registro && solucionDesbloqueada(registro) ? await leer(ej, ej.archivos.solucion).catch(() => null) : null;
    res.json({ codigo, lenguaje: ej.ext, oficial });
  });

  // Vuelve a correr los tests sin guardar (botón "Correr tests").
  router.post("/:id/correr", async (req, res) => {
    const ej = req.ejercicio;
    if (!(await workspace.existe(ej))) {
      return res.status(409).json({ error: "Primero abre el ejercicio en VS Code." });
    }
    corredor?.correr(ej);
    res.json({ ok: true });
  });

  return router;
}
