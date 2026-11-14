import express from "express";

export function crearApp() {
  const app = express();

  // Datos en memoria: cada crearApp() empieza de cero.
  const usuarios = [{ id: 1, nombre: "Ana", email: "ana@correo.com" }];
  let siguienteId = 2;

  // Middleware que lee los cuerpos JSON y los deja en req.body.
  // Sin esto, req.body sería undefined en todas las peticiones.
  app.use(express.json());

  app.get("/usuarios", (req, res) => {
    res.json(usuarios);
  });

  app.post("/usuarios", (req, res) => {
    // Si no vino cuerpo JSON, req.body es undefined: usamos {} para no romper.
    const { nombre, email } = req.body ?? {};

    // Validar ANTES de guardar. Cada error corta con return.
    if (typeof nombre !== "string" || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "El email no es válido" });
    }

    // Armamos el objeto con SOLO los campos permitidos (nada de ...req.body).
    const nuevo = { id: siguienteId++, nombre: nombre.trim(), email };
    usuarios.push(nuevo);

    // 201 Created + Location: dónde vive el recurso nuevo.
    res.status(201).location(`/usuarios/${nuevo.id}`).json(nuevo);
  });

  return app;
}
