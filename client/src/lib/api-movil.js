// Versión celular de api.js: misma forma (las páginas no notan la diferencia), pero sin servidor.
// Lee el contenido de los JSON exportados (public-movil/datos, que el service worker guarda para
// usarlos sin internet) y guarda tu progreso en el celular (progreso-movil.js).
// Las vistas y reglas son las mismas funciones puras que usa el servidor de la laptop.
import { seccionMarkdown } from "../../../server/markdown.js";
import { detalleTema, resumenTema } from "../../../server/vistas-aprender.js";
import { ejerciciosEntrevista, resumenEntrevistas, tarjetas } from "../../../server/vistas-entrevistas.js";
import { preguntaPendiente } from "../../../server/progreso-reglas.js";
import { fraseDelDia } from "../../../server/frases.js";
import { estadoGeneral, vistaInicio, vistaProgreso } from "../../../server/vistas-progreso.js";
import { preparacion } from "../../../server/metricas.js";
import { crearProgresoMovil, rachaMovil } from "./progreso-movil.js";

export const progreso = crearProgresoMovil(localStorage);

// Pide a Android que no borre los datos de la app si se queda sin espacio.
navigator.storage?.persist?.().catch(() => {});

const SECCION_MODELO = "Cómo explicarlo en la entrevista";

// --- Lectura de los JSON (cada archivo se pide una sola vez) ---
const archivos = new Map();

function json(ruta) {
  if (!archivos.has(ruta)) {
    const promesa = fetch(`/datos/${ruta}`).then(async (r) => {
      const texto = await r.text();
      // Si el archivo no existe, el hosting devuelve la página (HTML) en vez de JSON.
      if (!r.ok || texto.trimStart().startsWith("<")) throw new Error(`No se encontró el contenido (${ruta}).`);
      return JSON.parse(texto);
    });
    promesa.catch(() => archivos.delete(ruta)); // si falló, se puede reintentar
    archivos.set(ruta, promesa);
  }
  return archivos.get(ruta);
}

async function indice() {
  const lista = await json("ejercicios.json");
  return { ejercicios: lista, porId: new Map(lista.map((e) => [e.id, e])) };
}

async function aprender() {
  const temas = await json("aprender.json");
  return { temas, porId: new Map(temas.map((t) => [t.id, t])) };
}

/** Enunciado, pistas y solución de un ejercicio (del archivo de su colección). */
async function detalle(id) {
  const { porId } = await indice();
  const ej = porId.get(id);
  if (!ej) throw new Error(`No existe el ejercicio "${id}"`);
  const coleccion = await json(`col/${ej.coleccion.replaceAll("/", "__")}.json`);
  return { ej, ...coleccion[id] };
}

// --- Caché como en api.js: api.x.guardado() devuelve lo último que se pidió ---
const cache = new Map();
const conCache = (nombre, fn) => {
  const llamar = async (...args) => {
    const valor = await fn(...args);
    cache.set(nombre + JSON.stringify(args), valor);
    return valor;
  };
  llamar.guardado = (...args) => cache.get(nombre + JSON.stringify(args)) ?? null;
  return llamar;
};

/** Tras mezclar lo que llegó de la laptop, las pantallas deben volver a leer. */
export const limpiarCache = () => cache.clear();

const soloLaptop = () => Promise.reject(new Error("Esto se hace en la laptop, con VS Code y los tests."));

/** Lo que las vistas de Aprender necesitan de tu progreso (en el celular no hay ejercicios resueltos). */
const miProgreso = () => ({ registros: progreso.datos().ejercicios ?? {}, quizzes: progreso.datos().quizzes, hoy: progreso.hoy() });

/** Estado en el celular: "resuelto" si lo resolviste en la laptop (llega con la sincronización); si no, lo estudiado. */
const estadoMovil = (id) => (progreso.datos().ejercicios?.[id]?.estado === "resuelto" ? "resuelto" : progreso.estadoLectura(id));
const resumenEj = (e) => ({ ...e, estado: estadoMovil(e.id), ultimoResultado: null });

/** Lo que comparten Inicio y Progreso, igual que en el servidor de la laptop. */
function general(ejercicios) {
  const hoy = progreso.hoy();
  const datos = progreso.datos();
  const prep = preparacion(ejercicios, datos.ejercicios ?? {}, hoy);
  progreso.anotarPreparacion(prep.total);
  return estadoGeneral({ ejercicios, datos, dias: progreso.dias(), hoy, prep });
}

export const api = {
  // --- Ejercicios ---
  ejercicios: conCache("ejercicios", async () => (await indice()).ejercicios.map(resumenEj)),

  async ejercicio(id) {
    const d = await detalle(id);
    const lectura = progreso.deLectura(id);
    return {
      ...resumenEj(d.ej),
      enunciado: d.enunciado,
      totalPistas: d.pistas.length,
      pistas: d.pistas.slice(0, lectura?.pistasVistas ?? 0),
      sinSolucion: !d.solucion, // retos de entrevista: se resuelven en la laptop
      solucion: lectura?.vioSolucion && d.solucion ? d.solucion : null,
      modelo: lectura?.vioSolucion && d.solucion ? seccionMarkdown(d.solucion.explicacion, SECCION_MODELO) : null,
      progreso: lectura,
    };
  },

  async verPista(id, n) {
    const d = await detalle(id);
    if (!Number.isInteger(n) || n < 1 || n > d.pistas.length) throw new Error("Esa pista no existe.");
    const registro = progreso.verPista(id, n);
    if (!registro) throw new Error("Primero mira la pista anterior.");
    return { pistas: d.pistas.slice(0, registro.pistasVistas), progreso: registro };
  },

  async verSolucion(id) {
    const d = await detalle(id);
    if (!d.solucion) throw new Error("Este reto se resuelve en la laptop: su solución no está en el celular.");
    return { solucion: d.solucion, progreso: progreso.verSolucion(id) };
  },

  /** "¿Lo habrías resuelto sin ayuda?" (solo celular). nota: "no" | "dude" | "sabia" */
  autoevaluar: async (id, nota) => progreso.autoevaluar(id, nota),

  async guardarExplicacion(id, texto) {
    const d = await detalle(id);
    return {
      progreso: progreso.guardarExplicacion(id, String(texto).slice(0, 5000)),
      modelo: d.solucion ? seccionMarkdown(d.solucion.explicacion, SECCION_MODELO) : null,
    };
  },

  abrir: soloLaptop,
  reiniciar: soloLaptop,
  correr: soloLaptop,
  repasar: soloLaptop,
  apagar: soloLaptop,

  // --- Inicio y Progreso: lo mismo que calcula la laptop (con lo sincronizado de todos los dispositivos) ---
  inicio: conCache("inicio", async () => {
    const { ejercicios } = await indice();
    return vistaInicio(general(ejercicios), ejercicios);
  }),
  progreso: conCache("progreso", async () => {
    const { ejercicios } = await indice();
    return vistaProgreso(general(ejercicios), ejercicios, progreso.dias());
  }),

  // --- Hoy (pantalla de inicio del celular) ---
  hoy: conCache("hoy", async () => {
    const hoy = progreso.hoy();
    const datos = progreso.datos();
    const { ejercicios } = await indice();
    const { preguntas } = await json("entrevistas.json");
    const ejerciciosParaRepasar = ejercicios
      .filter((e) => progreso.estadoLectura(e.id) === "repasar")
      .map((e) => ({ id: e.id, titulo: e.titulo, coleccion: e.coleccion, nivel: e.nivel }));
    return {
      hoy,
      frase: fraseDelDia(hoy),
      config: datos.config,
      racha: rachaMovil(progreso.dias(), hoy),
      estudiadoHoy: progreso.dias()[hoy] ?? null,
      tarjetasParaHoy: preguntas.filter((p) => preguntaPendiente(datos.preguntas[p.id], hoy)).length,
      ejerciciosParaRepasar,
      quizzesHechos: Object.keys(datos.quizzes).length,
    };
  }),


  // --- Ajustes ---
  config: async () => progreso.datos().config,
  guardarConfig: async (cambios) => progreso.cambiarConfig(cambios),
  version: () => json("version.json"),

  // --- Entrevistas ---
  entrevistas: conCache("entrevistas", async () =>
    resumenEntrevistas(await json("entrevistas.json"), progreso.datos().preguntas, progreso.hoy()),
  ),
  tarjetas: async (filtro = {}) => tarjetas(await json("entrevistas.json"), progreso.datos().preguntas, progreso.hoy(), filtro),
  calificar: async (id, nota) => progreso.calificarPregunta(id, nota),
  ejerciciosEntrevista: async () => ejerciciosEntrevista((await indice()).ejercicios, {}),
  misRespuestas: async () => progreso.datos().misRespuestas ?? { pitch: "", historias: [], respuestas: {} },
  guardarMisRespuestas: async (datos) => progreso.guardarMisRespuestas(datos),

  // --- Aprender y Referencia ---
  temas: conCache("temas", async () => (await aprender()).temas.map((t) => resumenTema(t, miProgreso()))),
  tema: conCache("tema", async (id) => {
    const tema = detalleTema(await aprender(), id, await indice(), miProgreso());
    if (!tema) throw new Error("No existe ese tema.");
    return tema;
  }),
  async guardarQuiz(id, aciertos) {
    const tema = (await aprender()).porId.get(id);
    if (!tema) throw new Error("No existe ese tema.");
    return progreso.guardarQuiz(id, aciertos, tema.quiz.length);
  },
  referencia: conCache("referencia", () => json("referencia.json")),

  /** Chuletas (solo celular): la "Chuleta" y "En la entrevista" de cada tema de Aprender. */
  chuletas: conCache("chuletas", async () =>
    (await aprender()).temas.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      area: t.area,
      orden: t.orden,
      chuleta: seccionMarkdown(t.teoria, "Chuleta"),
      entrevista: seccionMarkdown(t.teoria, "En la entrevista"),
    })),
  ),

  // --- Lecciones estilo Duolingo (solo celular) ---
  /** Ítems generados (items.json) y preguntas de entrevista, con el progreso actual. */
  async lecciones() {
    const [datosItems, entrevistas] = await Promise.all([json("items.json"), json("entrevistas.json")]);
    const d = progreso.datos();
    const unidades = datosItems.unidades;
    const actual = unidades.find((u) => u.id === d.unidadActual) ?? unidades[0];
    return {
      unidades,
      items: datosItems.items,
      preguntas: entrevistas.preguntas,
      registros: d.items,
      registrosPreguntas: d.preguntas,
      reportados: d.reportados,
      unidadActual: actual?.id ?? null,
      lecciones: d.lecciones,
      enCurso: d.leccionEnCurso,
      hoy: progreso.hoy(),
    };
  },
  /** Tarjeta de un ejercicio: enunciado al frente; idea clave, solución y cómo explicarlo atrás. */
  async tarjetaEjercicio(id) {
    const d = await detalle(id);
    if (!d.solucion) return null;
    return {
      id,
      titulo: d.ej.titulo,
      coleccion: d.ej.coleccion,
      enunciado: d.enunciado,
      idea: seccionMarkdown(d.solucion.explicacion, "Idea clave"),
      codigo: d.solucion.codigo,
      lenguaje: d.solucion.lenguaje,
      modelo: seccionMarkdown(d.solucion.explicacion, SECCION_MODELO),
    };
  },
  calificarItem: async (clave, nota) => progreso.calificarItem(clave, nota),
  completarLeccion: async (xp) => {
    const r = progreso.completarLeccion(xp);
    cache.clear(); // Hoy y las demás pantallas deben ver la lección nueva
    return r;
  },
  reportar: async (clave) => progreso.reportar(clave),
  quitarReporte: async (clave) => progreso.quitarReporte(clave),
  reportados: async () => progreso.datos().reportados,
  elegirUnidad: async (id) => progreso.elegirUnidad(id),
  guardarLeccionEnCurso: async (sesion) => progreso.guardarLeccionEnCurso(sesion),

  /** Respaldo manual del progreso del celular (Ajustes). */
  exportarProgreso: () => progreso.exportar(),
  importarProgreso: async (texto) => {
    progreso.importar(texto);
    cache.clear();
  },
};
