import express from "express";

export function crearApp(db) {
  const app = express();
  app.use(express.json());

  // Preparamos las consultas una vez y las reutilizamos en cada petición.
  // Cada "?" es un parámetro: el valor viaja aparte y nunca se mezcla con el SQL.
  const todos = db.prepare("SELECT * FROM libros ORDER BY id");
  const porAutor = db.prepare("SELECT * FROM libros WHERE autor = ? ORDER BY id");
  const porId = db.prepare("SELECT * FROM libros WHERE id = ?");
  const insertar = db.prepare("INSERT INTO libros (titulo, autor, anio) VALUES (?, ?, ?)");

  app.get("/libros", (req, res) => {
    const { autor } = req.query;
    const libros = autor ? porAutor.all(autor) : todos.all();
    res.json(libros);
  });

  app.get("/libros/:id", (req, res) => {
    const libro = porId.get(Number(req.params.id)); // undefined si no hay fila
    if (!libro) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
    res.json(libro);
  });

  app.post("/libros", (req, res) => {
    const { titulo, autor, anio } = req.body ?? {};
    const textoValido = (t) => typeof t === "string" && t.trim() !== "";
    if (!textoValido(titulo) || !textoValido(autor) || !Number.isInteger(anio)) {
      return res.status(400).json({ error: "Envía titulo, autor (texto) y anio (entero)" });
    }

    // run devuelve { changes, lastInsertRowid }: el id que le dio la base.
    const { lastInsertRowid } = insertar.run(titulo.trim(), autor.trim(), anio);

    // Leemos la fila recién creada: así respondemos exactamente lo que quedó guardado.
    const creado = porId.get(lastInsertRowid);
    res.status(201).location(`/libros/${creado.id}`).json(creado);
  });

  return app;
}
