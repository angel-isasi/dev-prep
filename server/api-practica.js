// API de práctica: una API falsa en tu laptop para practicar el consumo de datos remotos como en
// el trabajo, donde las APIs tardan, fallan o vienen vacías. La sirve el motor en
// http://localhost:4321/api/practica (la puedes usar desde tus proyectos con Vite).
//
// Parámetros que acepta cualquier ruta (en la URL):
//   ?retraso=2000     tarda esos milisegundos (máximo 10 000; sin él, entre 200 y 800 ms)
//   ?fallo=0.3        falla con un error 500 el 30 % de las veces
//   ?estado=404       responde siempre con ese código de error (400 a 599)
//   ?vacio=1          las listas llegan vacías
//
// Rutas:
//   GET    /practica                 esta ayuda, en JSON
//   GET    /practica/productos       ?q= &categoria= &pagina= &limite=   lista paginada
//   GET    /practica/productos/:id   un producto (404 si no existe)
//   GET    /practica/tareas          tus tareas (se guardan en memoria hasta reiniciar el motor)
//   POST   /practica/tareas          { titulo }          crea una tarea (400 si el título está vacío)
//   PATCH  /practica/tareas/:id      { titulo?, hecha? } la actualiza
//   DELETE /practica/tareas/:id      la borra
import { Router } from "express";

const NOMBRES = [
  ["Teclado mecánico", "accesorios", 189.9],
  ["Mouse inalámbrico", "accesorios", 59.9],
  ["Monitor 24 pulgadas", "pantallas", 649],
  ["Audífonos con micrófono", "audio", 129.5],
  ["Laptop 14 pulgadas", "computadoras", 2899],
  ["Silla ergonómica", "muebles", 799],
  ["Escritorio regulable", "muebles", 1199],
  ["Webcam HD", "accesorios", 149],
  ["Parlante bluetooth", "audio", 99.9],
  ["Disco SSD 1 TB", "almacenamiento", 349],
  ["Memoria USB 64 GB", "almacenamiento", 35.5],
  ["Hub USB-C", "accesorios", 89],
  ["Tablet 10 pulgadas", "computadoras", 999],
  ["Monitor 27 pulgadas 4K", "pantallas", 1499],
  ["Micrófono de condensador", "audio", 279],
  ["Lámpara de escritorio", "muebles", 79.9],
  ["Cargador rápido 65 W", "accesorios", 119],
  ["Disco externo 2 TB", "almacenamiento", 389],
  ["Mini PC", "computadoras", 1690],
  ["Soporte para laptop", "accesorios", 69.9],
];

/** 40 productos fijos (siempre los mismos, para que tus pruebas sean repetibles). */
export const PRODUCTOS = Array.from({ length: 40 }, (_, i) => {
  const [nombre, categoria, precio] = NOMBRES[i % NOMBRES.length];
  const version = i < NOMBRES.length ? "" : " (2.ª generación)";
  return {
    id: i + 1,
    nombre: nombre + version,
    categoria,
    precio: i < NOMBRES.length ? precio : Math.round(precio * 1.15 * 10) / 10,
    stock: (i * 7) % 13,
  };
});

const sinTildes = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Lista paginada y filtrada (función pura).
 * @param {{ q?: string, categoria?: string, pagina?: number, limite?: number, vacio?: boolean }} filtro
 */
export function listarProductos({ q = "", categoria = "", pagina = 1, limite = 10, vacio = false } = {}) {
  const limiteOk = Math.min(Math.max(1, Number(limite) || 10), 40);
  let lista = vacio ? [] : PRODUCTOS;
  if (q) lista = lista.filter((p) => sinTildes(p.nombre).includes(sinTildes(q)));
  if (categoria) lista = lista.filter((p) => p.categoria === categoria);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / limiteOk));
  const paginaOk = Math.min(Math.max(1, Number(pagina) || 1), totalPaginas);
  const inicio = (paginaOk - 1) * limiteOk;
  return { datos: lista.slice(inicio, inicio + limiteOk), pagina: paginaOk, totalPaginas, total: lista.length };
}

/**
 * Decide cómo responde una petición según sus parámetros (función pura).
 * @returns {{ retraso: number, estado: number | null }}  estado null = responder normal
 */
export function comportamiento(query, azar = Math.random) {
  const pedido = Number(query.retraso);
  const retraso =
    Number.isFinite(pedido) && query.retraso !== undefined ? Math.min(Math.max(0, pedido), 10_000) : 200 + Math.floor(azar() * 600);
  const forzado = Number(query.estado);
  if (forzado >= 400 && forzado <= 599) return { retraso, estado: forzado };
  const fallo = Math.min(Math.max(0, Number(query.fallo) || 0), 1);
  if (fallo > 0 && azar() < fallo) return { retraso, estado: 500 };
  return { retraso, estado: null };
}

const MENSAJES = {
  400: "Petición inválida",
  401: "No autenticado",
  403: "Prohibido",
  404: "No encontrado",
  429: "Demasiadas peticiones",
  500: "Error del servidor",
  503: "Servicio no disponible",
};

/**
 * @param {{ esperar?: (ms: number) => Promise<void>, azar?: () => number }} opciones  inyectables para los tests
 */
export function rutasApiPractica({ esperar = (ms) => new Promise((r) => setTimeout(r, ms)), azar = Math.random } = {}) {
  const router = Router();
  let tareas = [
    { id: 1, titulo: "Repasar closures", hecha: true },
    { id: 2, titulo: "Resolver un reto de React", hecha: false },
    { id: 3, titulo: "Practicar el pitch en inglés", hecha: false },
  ];
  let siguienteId = 4;

  // Retraso y errores a propósito, en todas las rutas
  router.use(async (req, res, next) => {
    const { retraso, estado } = comportamiento(req.query, azar);
    if (retraso) await esperar(retraso);
    if (estado) return res.status(estado).json({ error: MENSAJES[estado] ?? `Error ${estado}` });
    next();
  });

  router.get("/", (req, res) =>
    res.json({
      descripcion: "API de práctica de dev-prep: tarda y falla a propósito para que practiques carga, error, vacío y reintento.",
      parametros: {
        retraso: "ms de espera (máx. 10000)",
        fallo: "probabilidad de error 500 (0 a 1)",
        estado: "código de error fijo (400 a 599)",
        vacio: "1 = listas vacías",
      },
      rutas: [
        "GET /api/practica/productos?q=&categoria=&pagina=&limite=",
        "GET /api/practica/productos/:id",
        "GET /api/practica/tareas",
        "POST /api/practica/tareas { titulo }",
        "PATCH /api/practica/tareas/:id { titulo?, hecha? }",
        "DELETE /api/practica/tareas/:id",
      ],
      categorias: [...new Set(PRODUCTOS.map((p) => p.categoria))],
    }),
  );

  router.get("/productos", (req, res) => res.json(listarProductos({ ...req.query, vacio: req.query.vacio === "1" })));

  router.get("/productos/:id", (req, res) => {
    const producto = PRODUCTOS.find((p) => p.id === Number(req.params.id));
    if (!producto) return res.status(404).json({ error: "No encontrado" });
    res.json(producto);
  });

  router.get("/tareas", (req, res) => res.json(req.query.vacio === "1" ? [] : tareas));

  router.post("/tareas", (req, res) => {
    const titulo = String(req.body?.titulo ?? "").trim();
    if (!titulo) return res.status(400).json({ error: "El título es obligatorio" });
    if (titulo.length > 120) return res.status(400).json({ error: "El título no puede pasar de 120 caracteres" });
    const tarea = { id: siguienteId++, titulo, hecha: false };
    tareas = [...tareas, tarea];
    res.status(201).json(tarea);
  });

  router.patch("/tareas/:id", (req, res) => {
    const tarea = tareas.find((t) => t.id === Number(req.params.id));
    if (!tarea) return res.status(404).json({ error: "No encontrado" });
    const cambio = {};
    if (typeof req.body?.hecha === "boolean") cambio.hecha = req.body.hecha;
    if (typeof req.body?.titulo === "string" && req.body.titulo.trim()) cambio.titulo = req.body.titulo.trim().slice(0, 120);
    const nueva = { ...tarea, ...cambio };
    tareas = tareas.map((t) => (t.id === tarea.id ? nueva : t));
    res.json(nueva);
  });

  router.delete("/tareas/:id", (req, res) => {
    const antes = tareas.length;
    tareas = tareas.filter((t) => t.id !== Number(req.params.id));
    if (tareas.length === antes) return res.status(404).json({ error: "No encontrado" });
    res.sendStatus(204);
  });

  return router;
}
