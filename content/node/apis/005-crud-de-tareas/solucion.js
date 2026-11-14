import express from "express";

export function crearApp() {
  const app = express();
  app.use(express.json());

  // Datos en memoria: viven dentro de crearApp, así cada app tiene los suyos.
  const tareas = [
    { id: 1, titulo: "Estudiar Express", hecha: false },
    { id: 2, titulo: "Practicar SQL", hecha: true },
  ];
  let siguienteId = 3;

  // Ayudante: busca por el id que viene en la URL (texto -> número).
  const buscar = (idTexto) => tareas.find((t) => t.id === Number(idTexto));
  const noEncontrada = (res) => res.status(404).json({ error: "Tarea no encontrada" });
  const esTituloValido = (titulo) => typeof titulo === "string" && titulo.trim() !== "";

  // READ: toda la colección
  app.get("/tareas", (req, res) => {
    res.json(tareas);
  });

  // READ: una tarea
  app.get("/tareas/:id", (req, res) => {
    const tarea = buscar(req.params.id);
    if (!tarea) return noEncontrada(res);
    res.json(tarea);
  });

  // CREATE
  app.post("/tareas", (req, res) => {
    const { titulo } = req.body ?? {};
    if (!esTituloValido(titulo)) {
      return res.status(400).json({ error: "El título es obligatorio" });
    }
    const nueva = { id: siguienteId++, titulo: titulo.trim(), hecha: false };
    tareas.push(nueva);
    res.status(201).json(nueva);
  });

  // UPDATE (PUT = reemplazo completo: hay que mandar todos los campos)
  app.put("/tareas/:id", (req, res) => {
    const tarea = buscar(req.params.id);
    if (!tarea) return noEncontrada(res); // primero: ¿existe?

    const { titulo, hecha } = req.body ?? {};
    if (!esTituloValido(titulo) || typeof hecha !== "boolean") {
      return res.status(400).json({ error: "Envía titulo (texto) y hecha (true o false)" });
    }

    // Modificamos el objeto que ya está dentro del arreglo.
    tarea.titulo = titulo.trim();
    tarea.hecha = hecha;
    res.json(tarea);
  });

  // DELETE
  app.delete("/tareas/:id", (req, res) => {
    const indice = tareas.findIndex((t) => t.id === Number(req.params.id));
    if (indice === -1) return noEncontrada(res);
    tareas.splice(indice, 1); // quita 1 elemento en esa posición
    res.sendStatus(204); // 204 No Content: sin cuerpo
  });

  return app;
}
