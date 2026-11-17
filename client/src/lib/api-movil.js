// Versión celular de api.js: misma forma (las páginas no notan la diferencia), pero sin servidor.
// Lee el contenido de los JSON exportados (public-movil/datos, que el service worker guarda para
// usarlos sin internet) y guarda tu progreso en el celular (progreso-movil.js).
// Las vistas y reglas son las mismas funciones puras que usa el servidor de la laptop.
import { seccionMarkdown } from "../../../server/markdown.js";
import { detalleTema, resumenTema } from "../../../server/vistas-aprender.js";
import { ejerciciosEntrevista, resumenEntrevistas, tarjetas } from "../../../server/vistas-entrevistas.js";
import { preguntaPendiente, sumarDias } from "../../../server/progreso-reglas.js";
import { fraseDelDia } from "../../../server/frases.js";
import { estadoGeneral, vistaInicio, vistaProgreso } from "../../../server/vistas-progreso.js";
import { preparacion } from "../../../server/metricas.js";
import { crearProgresoMovil, rachaMovil } from "./progreso-movil.js";
import { mapaDominio, unidadesDebiles } from "../../../server/dominio.js";
import { erroresFrecuentes } from "../../../server/errores.js";
import { calcularLogros, semaforoPostular } from "../../../server/logros.js";
import { analizarOferta, palabrasParaCv } from "../../../server/ofertas.js";
import { diaSemana, lunesDe } from "../../../server/metricas.js";
import { avanceUnidad } from "../movil/leccion/motor.js";
import { expandirIngles, registrosPorConcepto } from "../../../scripts/items/ingles.js";
import { contadoresDeLeccion, ligaSemanal, misionesDelDia, premioDeCofre, XP_COFRE_DIARIO } from "../movil/ingles/misiones.js";
import { compararAvance, marcaPersonal, planDeLaSemana, resultadoReto, retoDeLaSemana } from "../../../server/avance.js";
import { buscarOfertas, nuevasDesde, ordenarOfertas } from "../../../server/ofertas-auto.js";
import { conFechaDeEnvio, metaSemanal, numerosPostulaciones, seguimientosPendientes } from "../../../server/postulaciones.js";
import { crearApi } from "./api-servidor.js";
import { BASE_LOCAL, conectada } from "./conexion-local.js";

export const progreso = crearProgresoMovil(localStorage);

// Pide a Android que no borre los datos de la app si se queda sin espacio.
navigator.storage?.persist?.().catch(() => {});

const SECCION_MODELO = "Cómo explicarlo en la entrevista";

/** Ofertas que viste la última vez (por dispositivo) y las de la visita anterior a esta. */
const CLAVE_VISTAS = "devprep-ofertas-vistas";
let vistasAlAbrir;

/** Huella corta de un texto (para no guardar dos veces la misma oferta). */
function huella(texto) {
  let h = 2166136261;
  for (const c of String(texto).replace(/\s+/g, " ").trim().slice(0, 400)) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return (h >>> 0).toString(36);
}

// --- Lectura de los JSON (cada archivo se pide una sola vez) ---
const archivos = new Map();

/** Lo propio de las lecciones de inglés: historias hechas, cofres, unidades legendarias, vidas, récords. */
const extraIngles = () => progreso.ajuste("inglesExtra", {});
const guardarExtra = (cambios) => progreso.cambiarAjuste("inglesExtra", { ...extraIngles(), ...cambios });

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
/** Ítems de inglés de las tres etapas juntos (un archivo por etapa; si alguno no existe, se omite). */
let inglesExpandido = null; // el archivo trae conceptos compactos: se expanden una sola vez
async function itemsIngles() {
  if (inglesExpandido) return inglesExpandido;
  const partes = await Promise.all(["basico", "intermedio", "trabajo"].map((e) => json(`items-ingles-${e}.json`).catch(() => null)));
  const datos = expandirIngles({ unidades: partes.flatMap((p) => p?.unidades ?? []), items: partes.flatMap((p) => p?.items ?? []) });
  if (partes.every(Boolean)) inglesExpandido = datos;
  return datos;
}

/** ¿Hubo alguna semana con la meta cumplida de lunes a viernes? */
function huboSemanaPerfecta(estados) {
  for (const [fecha, estado] of Object.entries(estados ?? {})) {
    if (estado !== "cumplio" || diaSemana(fecha) !== 0) continue;
    const lunes = lunesDe(fecha);
    if ([1, 2, 3, 4].every((i) => estados[sumarDias(lunes, i)] === "cumplio")) return true;
  }
  return false;
}

/** Todo lo que miden los niveles, las insignias y el semáforo para postular. */
async function estadoLogros() {
  const [{ ejercicios }, datosItems, ap, ingles] = await Promise.all([indice(), json("items.json"), aprender(), itemsIngles()]);
  const d = progreso.datos();
  const dias = progreso.dias();
  const registros = d.ejercicios ?? {};
  const resuelto = (e) => registros[e.id]?.estado === "resuelto";
  const g = general(ejercicios);
  const mapa = mapaDominio({ unidades: datosItems.unidades, ejercicios, temas: ap.temas, registros, quizzes: d.quizzes ?? {}, items: datosItems.items, registrosItems: d.items ?? {}, hoy: progreso.hoy() });
  const suma = (campo) => Object.values(dias).reduce((total, dia) => total + (dia?.[campo] ?? 0), 0);
  const mis = d.misRespuestas ?? {};
  const examenes = Object.values(progreso.registros("examenes"));
  return {
    resueltos: ejercicios.filter(resuelto).length,
    limpios: suma("limpios"),
    retos: ejercicios.filter((e) => /\/retos$/.test(e.coleccion) && resuelto(e)).length,
    depurados: ejercicios.filter((e) => /\/depurar$/.test(e.coleccion) && resuelto(e)).length,
    preparacion: g.prep.total,
    verdes: mapa.filter((u) => u.estado === "verde").length,
    lecciones: suma("lecciones"),
    racha: g.dias.racha,
    tarjetasDominadas: Object.values(d.preguntas ?? {}).filter((r) => (r.caja ?? 0) >= 3).length,
    simulacros: Object.keys(progreso.registros("simulacros")).length,
    pitch: !!mis.pitch?.trim(),
    historias: (mis.historias ?? []).filter((h) => h.situacion?.trim() || h.accion?.trim()).length,
    postulaciones: Object.values(progreso.registros("postulaciones")).filter((p) => p.etapa && p.etapa !== "por-postular").length,
    inglesDominadas: ingles.unidades.filter((u) => avanceUnidad(ingles.items, d.items ?? {}, u.id).dominada).length,
    inglesLecciones: suma("ingles"),
    predice: Object.entries(d.items ?? {}).filter(([clave, r]) => clave.startsWith("pred:") && (r.caja ?? 0) >= 3).length,
    revisionesPerfectas: Object.values(progreso.registros("revisiones")).filter((r) => r.total && r.encontrados === r.total && !r.falsasAlarmas).length,
    jefes: suma("jefes"),
    examenes: examenes.length,
    mejorExamen: Math.max(0, ...examenes.map((e) => e.nota ?? 0)),
    semanaPerfecta: huboSemanaPerfecta(g.dias.estados),
    inmersionMinutos: suma("inmersion"),
    enfoques: suma("enfoques"),
    portafolio: Object.values(progreso.registros("portafolio")).filter((p) => p.exportado).length,
  };
}

function general(ejercicios) {
  const hoy = progreso.hoy();
  const datos = progreso.datos();
  const prep = preparacion(ejercicios, datos.ejercicios ?? {}, hoy);
  progreso.anotarPreparacion(prep.total);
  return estadoGeneral({ ejercicios, datos, dias: progreso.dias(), hoy, prep });
}

const apiWeb = {
  url: (ruta) => ruta,
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
      ...(() => {
        const g = general(ejercicios);
        return { juego: g.juego, meta: g.dias.hoy, salvados: g.dias.salvados, jefe: g.jefe ? { id: g.jefe.id, titulo: g.jefe.titulo } : null };
      })(),
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
  /** @param {"programacion"|"ingles"} [ambito] las lecciones de inglés usan sus propios ítems y su unidad actual */
  async lecciones(ambito = "programacion") {
    const ingles = ambito === "ingles";
    const [datosItems, entrevistas] = await Promise.all([ingles ? itemsIngles() : json("items.json"), ingles ? null : json("entrevistas.json")]);
    const d = progreso.datos();
    const unidades = datosItems.unidades;
    const elegida = ingles ? progreso.ajuste("ingles", {}).unidad : d.unidadActual;
    const actual = unidades.find((u) => u.id === elegida) ?? unidades[0];
    const enCurso = d.leccionEnCurso && (d.leccionEnCurso.ambito ?? "programacion") === ambito ? d.leccionEnCurso : null;
    return {
      ambito,
      unidades,
      items: datosItems.items,
      preguntas: entrevistas?.preguntas ?? [],
      // En inglés, el progreso viejo (una clave por forma de preguntar) se junta en su concepto
      registros: ingles ? registrosPorConcepto(d.items) : d.items,
      registrosPreguntas: d.preguntas,
      extra: ingles ? extraIngles() : null,
      reportados: d.reportados,
      unidadActual: actual?.id ?? null,
      lecciones: d.lecciones,
      enCurso,
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
  completarLeccion: async (xp, { ambito = "programacion", segundos = 0 } = {}) => {
    const r = progreso.completarLeccion(xp, { campo: ambito === "ingles" ? "ingles" : "lecciones", segundos });
    cache.clear(); // Hoy y las demás pantallas deben ver la lección nueva
    return r;
  },
  reportar: async (clave) => progreso.reportar(clave),
  quitarReporte: async (clave) => progreso.quitarReporte(clave),
  reportados: async () => progreso.datos().reportados,
  elegirUnidad: async (id) => progreso.elegirUnidad(id),

  // --- Aprender mejor ---
  /** Mapa de lo que dominas por unidad y tus unidades más flojas. */
  async mapa() {
    const [{ ejercicios }, datosItems, ap] = await Promise.all([indice(), json("items.json"), aprender()]);
    const d = progreso.datos();
    const unidades = mapaDominio({
      unidades: datosItems.unidades,
      ejercicios,
      temas: ap.temas,
      registros: d.ejercicios ?? {},
      quizzes: d.quizzes ?? {},
      items: datosItems.items,
      registrosItems: d.items ?? {},
      hoy: progreso.hoy(),
    });
    return { unidades, debiles: unidadesDebiles(unidades) };
  },
  /** Tus errores más comunes al correr los tests (los cuenta la laptop y llegan al sincronizar). */
  erroresFrecuentes: async () => erroresFrecuentes(progreso.dias()).slice(0, 5),
  glosario: () => json("glosario.json"),
  revision: () => json("revision.json"),
  revisionesHechas: async () => progreso.registros("revisiones"),
  /** Guarda tu mejor resultado en un caso de revisión de código. */
  guardarRevision: async (id, resultado) => {
    const previo = progreso.registros("revisiones")[id];
    if (!previo || resultado.puntaje >= (previo.puntaje ?? 0)) progreso.guardarRegistro("revisiones", id, { ...resultado, fecha: progreso.hoy() });
  },
  /** "Explícalo en 30 segundos": tu autoevaluación al comparar con la explicación modelo. */
  calificarExplicacion: async (id, nota, segundos) => progreso.guardarRegistro("explicaciones", id, { nota, segundos, fecha: progreso.hoy() }),

  // --- Niveles, insignias y semáforo para postular ---
  async logros() {
    const estado = await estadoLogros();
    return { ...calcularLogros(estado, progreso.registros("logrosVistos")), estado };
  },
  /** Los logros nuevos ya se celebraron: no se vuelven a celebrar en ningún dispositivo. */
  marcarLogros: async (ids) => {
    for (const id of ids) progreso.guardarRegistro("logrosVistos", id, { fecha: progreso.hoy() });
  },
  async semaforo() {
    const estado = await estadoLogros();
    const { nivel } = calcularLogros(estado, progreso.registros("logrosVistos"));
    return semaforoPostular(estado, nivel.id);
  },

  // --- Rutina: plan de hoy, examen semanal, enfoque, reto y resumen del mes, diario, horario ---
  /** Una sola lista de lo que toca hoy, en orden, con lo ya hecho marcado. */
  async planDeHoy() {
    const { ejercicios } = await indice();
    const g = general(ejercicios);
    const hoy = progreso.hoy();
    const dia = progreso.dias()[hoy] ?? {};
    const ingles = await apiWeb.inglesHoy();
    const { preguntas } = await json("entrevistas.json");
    const d = progreso.datos();
    const tarjetas = preguntas.filter((p) => preguntaPendiente(d.preguntas[p.id], hoy)).length;
    const lunes = lunesDe(hoy);
    const finDeSemana = diaSemana(hoy) >= 5;
    const examenHecho = !!progreso.registros("examenes")[lunes];
    const diarioHecho = !!progreso.registros("diario")[hoy];
    const siguiente = vistaInicio(g, ejercicios).continuar ?? vistaInicio(g, ejercicios).siguiente;
    const pasos = [
      g.dias.hoy.pausa
        ? null
        : {
            id: "meta",
            texto: `Meta: ${g.dias.hoy.meta} ${g.dias.hoy.meta === 1 ? "ejercicio o repaso" : "ejercicios o repasos"}`,
            detalle: `${g.dias.hoy.hecho} de ${g.dias.hoy.meta}${siguiente ? ` · sigue con ${siguiente.titulo}` : ""}`,
            hecho: g.dias.hoy.cumplioMeta,
            a: siguiente ? `/practicar/${siguiente.id}` : "/practicar",
          },
      { id: "ingles", texto: `Inglés: ${ingles.meta} minutos`, detalle: `${Math.floor(ingles.minutosHoy)} de ${ingles.meta} min`, hecho: ingles.minutosHoy >= ingles.meta, a: "/leccion?ambito=ingles" },
      { id: "leccion", texto: "Una lección de programación", detalle: "10 preguntas, unos 5 minutos", hecho: (dia.lecciones ?? 0) > 0, a: "/leccion" },
      tarjetas > 0 ? { id: "tarjetas", texto: `${tarjetas} tarjetas de entrevista para repasar`, detalle: "Piensa la respuesta y luego revela", hecho: false, a: "/entrevistas" } : null,
      finDeSemana ? { id: "examen", texto: "Examen semanal", detalle: "20 preguntas de lo que viste esta semana", hecho: examenHecho, a: "/leccion?modo=examen" } : null,
      g.dias.hoy.cumplioMeta ? { id: "diario", texto: "Tu diario de una línea", detalle: "¿Qué aprendiste hoy? ¿Qué te trabó?", hecho: diarioHecho, a: "/diario" } : null,
    ].filter(Boolean);
    return { pasos, siguiente: pasos.find((p) => !p.hecho) ?? null, pausa: g.dias.hoy.pausa };
  },

  /** Examen semanal terminado: nota de 0 a 20, una por semana (se queda la mejor). */
  guardarExamen: async ({ aciertos, total }) => {
    const lunes = lunesDe(progreso.hoy());
    const nota = total ? Math.round((aciertos / total) * 20) : 0;
    const previo = progreso.registros("examenes")[lunes];
    if (!previo || nota > previo.nota) progreso.guardarRegistro("examenes", lunes, { nota, aciertos, total, fecha: progreso.hoy() });
    cache.clear();
    return nota;
  },
  examenes: async () =>
    Object.entries(progreso.registros("examenes"))
      .map(([semana, e]) => ({ semana, ...e }))
      .sort((a, b) => a.semana.localeCompare(b.semana)),

  /** Simulacro terminado: queda en tu historial y cuenta para niveles, insignias y tiempo libre. */
  guardarSimulacro: async (simulacro) => {
    progreso.guardarRegistro("simulacros", `sim-${Date.now().toString(36)}`, { ...simulacro, fecha: progreso.hoy() });
    progreso.sumarDia("simulacros");
    cache.clear();
  },
  simulacros: async () =>
    Object.entries(progreso.registros("simulacros"))
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? "")),

  /** Sesión de enfoque de 25 minutos completa. */
  completarEnfoque: async () => {
    progreso.sumarDia("enfoques");
    cache.clear();
  },

  /** Diario de una línea de un día. */
  guardarDiario: async (texto) => {
    progreso.guardarRegistro("diario", progreso.hoy(), { aprendi: String(texto.aprendi ?? "").slice(0, 280), trabe: String(texto.trabe ?? "").slice(0, 280) });
    cache.clear();
  },
  diario: async () =>
    Object.entries(progreso.registros("diario"))
      .map(([fecha, e]) => ({ fecha, ...e }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),

  /** Resumen de un mes (por defecto el anterior) comparado con el mes previo. */
  async resumenMes(mes) {
    const hoy = progreso.hoy();
    const anteriorDe = (m) => {
      const [a, n] = m.split("-").map(Number);
      return n === 1 ? `${a - 1}-12` : `${a}-${String(n - 1).padStart(2, "0")}`;
    };
    const objetivo = mes ?? anteriorDe(hoy.slice(0, 7));
    const dias = progreso.dias();
    const cifras = (m) => {
      const delMes = Object.entries(dias).filter(([f]) => f.startsWith(m)).map(([, d]) => d);
      const suma = (c) => delMes.reduce((t, d) => t + (d?.[c] ?? 0), 0);
      return {
        resueltos: suma("resueltos"),
        repasos: suma("repasos"),
        lecciones: suma("lecciones"),
        ingles: Math.round(suma("inglesSegundos") / 60 + suma("inmersion")),
        estudio: Math.round((suma("segundos") + suma("leccionesSegundos") + suma("inglesSegundos")) / 60),
        juego: Math.round(suma("juego") / 60),
        diasActivos: delMes.filter((d) => (d?.resueltos ?? 0) + (d?.repasos ?? 0) + (d?.lecciones ?? 0) + (d?.ingles ?? 0) + (d?.preguntas ?? 0) > 0).length,
      };
    };
    return { mes: objetivo, cifras: cifras(objetivo), antes: cifras(anteriorDe(objetivo)) };
  },

  /** Reto del mes: el elegido (con su avance) o 3 propuestas según tu área más floja. */
  async retoMes() {
    const mes = progreso.hoy().slice(0, 7);
    const elegido = progreso.ajuste("retoMes", null);
    const estado = await estadoLogros();
    const dias = progreso.dias();
    const delMes = (campo) => Object.entries(dias).filter(([f]) => f.startsWith(mes)).reduce((t, [, d]) => t + (d?.[campo] ?? 0), 0);
    const valor = (tipo) => (tipo === "resueltos" ? delMes("resueltos") : tipo === "ingles" ? delMes("ingles") : tipo === "verdes" ? estado.verdes : tipo === "retos" ? estado.retos : delMes("lecciones"));
    if (elegido?.mes === mes) {
      const avance = tipo => Math.max(0, valor(tipo) - (elegido.inicio ?? 0));
      const actual = ["verdes", "retos"].includes(elegido.tipo) ? avance(elegido.tipo) : valor(elegido.tipo);
      return { elegido: { ...elegido, actual: Math.min(actual, elegido.meta), cumplido: actual >= elegido.meta }, propuestas: [] };
    }
    const propuestas = [
      { tipo: "resueltos", meta: 20, titulo: "Resuelve 20 ejercicios este mes" },
      { tipo: "verdes", meta: 3, titulo: "Pon 3 temas más en verde en tu mapa" },
      { tipo: "ingles", meta: 25, titulo: "Completa 25 lecciones de inglés" },
      { tipo: "retos", meta: 5, titulo: "Resuelve 5 retos de entrevista" },
    ];
    return { elegido: null, propuestas: propuestas.slice(0, 3).concat(estado.retos < 10 ? [] : []).slice(0, 3) };
  },
  elegirRetoMes: async ({ tipo, meta, titulo }) => {
    const estado = await estadoLogros();
    const inicio = tipo === "verdes" ? estado.verdes : tipo === "retos" ? estado.retos : 0;
    progreso.cambiarAjuste("retoMes", { mes: progreso.hoy().slice(0, 7), tipo, meta, titulo, inicio });
  },

  /** "Mi semana", pausas, juego y meta de inglés (se mezclan entre dispositivos uno por uno). */
  rutina: async () => ({
    horario: progreso.ajuste("horario", { lun: "normal", mar: "normal", mie: "normal", jue: "normal", vie: "normal", sab: "normal", dom: "normal" }),
    pausas: progreso.ajuste("pausas", { lista: [] }).lista,
    juego: progreso.ajuste("juego", { tope: 120, procesos: ["dota2.exe"] }),
    metaIngles: progreso.datos().config.metaIngles ?? 15,
    metaDiaria: progreso.datos().config.metaDiaria,
  }),
  guardarHorario: async (horario) => {
    progreso.cambiarAjuste("horario", horario);
    cache.clear();
  },
  guardarPausas: async (lista) => {
    progreso.cambiarAjuste("pausas", { lista });
    cache.clear();
  },
  /** Avisos: hora fija del recordatorio (null = tu hora habitual) y zona horaria de este dispositivo. */
  guardarAvisos: async ({ hora }) => {
    progreso.cambiarAjuste("avisos", { ...progreso.ajuste("avisos", {}), hora, zona: Intl.DateTimeFormat().resolvedOptions().timeZone });
  },
  guardarJuego: async (juego) => {
    progreso.cambiarAjuste("juego", juego);
    cache.clear();
  },

  // --- Conseguir trabajo: postulaciones, preguntas reales, oferta, CV ---
  postulaciones: async () =>
    Object.entries(progreso.registros("postulaciones"))
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? "")),
  guardarPostulacion: async ({ id, ...datos }) => {
    const clave = id ?? `post-${Date.now().toString(36)}`;
    const { en: _en, ...resto } = datos;
    progreso.guardarRegistro("postulaciones", clave, conFechaDeEnvio({ ...resto, fecha: datos.fecha ?? progreso.hoy() }, progreso.hoy()));
    cache.clear();
    return clave;
  },
  /** Seguimiento, tus números y la meta semanal de postulaciones (ver server/postulaciones.js). */
  async resumenPostulaciones() {
    const lista = Object.values(progreso.registros("postulaciones"));
    const hoy = progreso.hoy();
    const meta = Number(progreso.ajuste("metaPostulaciones", { valor: 0 }).valor) || 0;
    return {
      pendientes: seguimientosPendientes(
        Object.entries(progreso.registros("postulaciones")).map(([id, p]) => ({ id, ...p })),
        hoy,
      ),
      numeros: numerosPostulaciones(lista, hoy),
      meta: metaSemanal(lista, hoy, meta),
    };
  },
  cambiarMetaPostulaciones: async (valor) => progreso.cambiarAjuste("metaPostulaciones", { valor: Math.max(0, Math.min(20, Number(valor) || 0)) }),
  /** "Ya le escribí": el contador de 7 días vuelve a empezar desde hoy. */
  marcarSeguimiento: async (id) => {
    const { en: _en, ...p } = progreso.registros("postulaciones")[id] ?? {};
    if (!p.empresa) return;
    progreso.guardarRegistro("postulaciones", id, { ...p, seguimientoEl: progreso.hoy(), seguimientos: (p.seguimientos ?? 0) + 1 });
  },
  marcarSinRespuesta: async (id) => {
    const { en: _en, ...p } = progreso.registros("postulaciones")[id] ?? {};
    if (!p.empresa) return;
    progreso.guardarRegistro("postulaciones", id, { ...p, etapa: "sin-respuesta" });
  },
  borrarPostulacion: async (id) => {
    progreso.borrarRegistro("postulaciones", id);
    cache.clear();
  },
  /** Preguntas que te hicieron de verdad en una entrevista: entran a tu repaso como tarjetas. */
  preguntasPropias: async () => {
    const d = progreso.datos();
    const hoy = progreso.hoy();
    return Object.entries(progreso.registros("preguntasPropias")).map(([id, p]) => ({
      id,
      categoria: "Me preguntaron",
      personal: false,
      claves: [],
      ...p,
      pendiente: preguntaPendiente(d.preguntas[id], hoy) || !d.preguntas[id],
    }));
  },
  guardarPreguntaPropia: async ({ id, pregunta, respuesta = "", empresa = "" }) => {
    const clave = id ?? `propia-${Date.now().toString(36)}`;
    progreso.guardarRegistro("preguntasPropias", clave, {
      pregunta: String(pregunta).slice(0, 500),
      respuesta: String(respuesta).slice(0, 3000) || "Todavía no escribiste tu respuesta: investígala y escríbela aquí.",
      empresa: String(empresa).slice(0, 80),
    });
    return clave;
  },
  borrarPreguntaPropia: async (id) => progreso.borrarRegistro("preguntasPropias", id),
  calificarPropia: async (id, nota) => progreso.calificarPregunta(id, nota),
  /** Pegas una oferta: qué tecnologías pide y cuánto las dominas. */
  async analizarOferta(texto) {
    const [{ unidades }, ingles] = await Promise.all([apiWeb.mapa(), itemsIngles()]);
    const estado = await estadoLogros();
    const resultado = analizarOferta(texto, unidades, { inglesDominadas: estado.inglesDominadas, inglesTotal: ingles.unidades.length });
    // Se guardan solo las tecnologías (no el texto) para el plan de la semana: "lo que más piden"
    if (resultado.tecnologias.length) {
      const id = `of-${huella(texto)}`;
      progreso.guardarRegistro("ofertasAnalizadas", id, { tecnologias: resultado.tecnologias.map(({ nombre, estado }) => ({ nombre, estado })), fecha: progreso.hoy() });
    }
    return resultado;
  },

  /**
   * Ofertas para ti: busca en las bolsas de trabajo y las ordena según tu perfil (sin IA).
   * Con la laptop conectada usa las 4 fuentes; sin ella, las 3 que el navegador puede leer.
   * La última búsqueda queda en este dispositivo para verla sin internet.
   */
  async ofertasParaTi({ nuevo = false } = {}) {
    const CLAVE = "devprep-ofertas";
    const guardada = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    const fresca = guardada && Date.now() - Date.parse(guardada.buscadoEn) < 3 * 60 * 60 * 1000;
    let busqueda = !nuevo && fresca ? guardada : null;
    if (!busqueda) {
      try {
        busqueda = conectada()
          ? await apiLocal.buscarOfertasMotor(nuevo)
          : { ...(await buscarOfertas(fetch, { soloNavegador: true })), buscadoEn: new Date().toISOString() };
        localStorage.setItem(CLAVE, JSON.stringify(busqueda));
      } catch (error) {
        if (!guardada) throw error;
        busqueda = { ...guardada, sinConexion: true };
      }
    }
    const [{ unidades }, ingles, { datos: cv, habilidades }] = await Promise.all([apiWeb.mapa(), itemsIngles(), apiWeb.cv()]);
    const estado = await estadoLogros();
    const perfil = { mapa: unidades, ingles: { inglesDominadas: estado.inglesDominadas, inglesTotal: ingles.unidades.length }, hoy: progreso.hoy() };
    const yaGuardadas = new Set(Object.values(progreso.registros("postulaciones")).map((p) => p.enlace).filter(Boolean));
    const ordenadas = ordenarOfertas(busqueda.ofertas ?? [], perfil, { limite: 300 });

    // "Nuevas desde tu última visita": se compara con lo que había la vez anterior que abriste la app
    // (se lee una vez por visita, así guardar u ocultar no borra las marcas de "Nueva").
    const ids = ordenadas.map((o) => o.id);
    const vistas = JSON.parse(localStorage.getItem(CLAVE_VISTAS) ?? "null");
    if (vistasAlAbrir === undefined) vistasAlAbrir = vistas;
    const nuevas = new Set(nuevasDesde(ids, vistasAlAbrir));
    localStorage.setItem(CLAVE_VISTAS, JSON.stringify([...new Set([...ids, ...(vistas ?? [])])].slice(0, 2000)));

    // Palabras clave para tu CV: lo que pide la oferta y no aparece en tu CV
    const textoCv = [
      cv.titular,
      cv.sobreMi,
      ...habilidades.map((h) => `${h.nombre} ${h.temas.join(" ")}`),
      ...(cv.proyectos ?? []).map((p) => `${p.titulo} ${p.descripcion}`),
    ].join("\n");

    const marcas = progreso.registros("ofertasMarcadas");
    const enLista = new Set(ids);
    return {
      ofertas: ordenadas.map(({ texto: _t, ...o }) => ({
        ...o,
        guardada: yaGuardadas.has(o.url),
        marca: marcas[o.id]?.estado ?? null,
        nueva: nuevas.has(o.id),
        paraCv: palabrasParaCv(o.tecnologias, textoCv),
      })),
      // Guardadas que ya no salen en la búsqueda (cerraron o salieron del top): se ven con lo que se guardó
      guardadasFuera: Object.entries(marcas)
        .filter(([id, m]) => m.estado === "guardada" && !enLista.has(id))
        .map(([id, m]) => ({ id, ...m })),
      cv,
      fuentes: busqueda.fuentes ?? [],
      buscadoEn: busqueda.buscadoEn,
      sinConexion: !!busqueda.sinConexion,
      conLaptop: conectada(),
    };
  },
  /** Guardar para revisar después u ocultar una oferta (null = quitar la marca). Se sincroniza. */
  marcarOferta: async (o, estado) => {
    if (!estado) return progreso.borrarRegistro("ofertasMarcadas", o.id);
    progreso.guardarRegistro(
      "ofertasMarcadas",
      o.id,
      estado === "guardada"
        ? { estado, titulo: o.titulo, empresa: o.empresa, url: o.url, fuente: o.fuente, puntaje: o.puntaje, fecha: o.fecha ?? null }
        : { estado },
    );
  },
  /** Pasa una oferta a tus postulaciones, en "Por postular". */
  guardarOfertaComoPostulacion: async (o) =>
    apiWeb.guardarPostulacion({
      empresa: o.empresa || o.fuente,
      puesto: o.titulo,
      enlace: o.url,
      fuente: o.fuente,
      etapa: "por-postular",
      notas: `De ${o.fuente}. Puntaje ${o.puntaje}/100: ${o.razones.map((r) => r.texto).join("; ")}.`,
      proximo: "Revisar requisitos y postular",
      proximoFecha: "",
    }),

  /** Git práctico: los escenarios que resolviste (los prepara y revisa el motor de la laptop). */
  gitResueltos: async () => progreso.registros("git"),
  marcarGit: async (id) => {
    if (!progreso.registros("git")[id]) progreso.guardarRegistro("git", id, { fecha: progreso.hoy() });
  },

  /** "Tu día en números": lo que hiciste hoy, para verlo al cerrar el día. */
  async diaEnNumeros() {
    const hoy = progreso.hoy();
    const d = progreso.dias()[hoy] ?? {};
    const { ejercicios } = await indice();
    const g = general(ejercicios);
    const minutos = (s) => Math.round((s ?? 0) / 60);
    const cifras = [
      { id: "resueltos", texto: d.resueltos === 1 ? "ejercicio resuelto" : "ejercicios resueltos", valor: d.resueltos ?? 0 },
      { id: "repasos", texto: d.repasos === 1 ? "repaso" : "repasos", valor: d.repasos ?? 0 },
      { id: "preguntas", texto: "tarjetas de entrevista", valor: d.preguntas ?? 0 },
      { id: "lecciones", texto: d.lecciones === 1 ? "lección" : "lecciones", valor: d.lecciones ?? 0 },
      { id: "ingles", texto: "min de inglés", valor: minutos(d.inglesSegundos) + (d.inmersion ?? 0) },
      { id: "estudio", texto: "min de estudio", valor: minutos((d.segundos ?? 0) + (d.leccionesSegundos ?? 0) + (d.inglesSegundos ?? 0)) },
      { id: "simulacros", texto: d.simulacros === 1 ? "simulacro" : "simulacros", valor: d.simulacros ?? 0 },
    ].filter((c) => c.valor > 0 || ["resueltos", "estudio"].includes(c.id));
    const algo = cifras.some((c) => c.valor > 0);
    return { fecha: hoy, cifras, algo, cumplioMeta: g.dias.hoy.cumplioMeta, racha: g.dias.racha ?? 0, juego: minutos(d.juego) };
  },

  // --- Cuánto avancé, reto de la semana y plan de la semana (reglas en server/avance.js) ---
  async avance() {
    const { ejercicios } = await indice();
    const dias = progreso.dias();
    const primerDia = Object.keys(dias).sort()[0] ?? null;
    return compararAvance({ ejercicios, registros: progreso.datos().ejercicios ?? {}, hoy: progreso.hoy(), primerDia });
  },
  async retoSemana() {
    const { ejercicios } = await indice();
    const lunes = lunesDe(progreso.hoy());
    const historial = progreso.registros("retosSemana");
    const registros = progreso.datos().ejercicios ?? {};
    const guardado = historial[lunes];
    // El reto queda fijo desde que lo empiezas (aunque cambie tu progreso en otros ejercicios)
    const elegido = ejercicios.find((e) => e.id === guardado?.id) ?? retoDeLaSemana(ejercicios, registros, lunes);
    if (!elegido) return null;
    const resultado = resultadoReto(guardado, registros[elegido.id], elegido.nivel);
    if (resultado.estado === "resuelto" && guardado && guardado.puntos !== resultado.puntos) {
      progreso.guardarRegistro("retosSemana", lunes, { ...guardado, puntos: resultado.puntos, segundos: resultado.segundos, pistas: resultado.pistas });
    }
    const otros = Object.fromEntries(Object.entries(historial).filter(([s]) => s !== lunes));
    return {
      semana: lunes,
      reto: { id: elegido.id, titulo: elegido.titulo, nivel: elegido.nivel, coleccion: elegido.coleccion, tema: elegido.tema },
      empezado: !!guardado?.inicio,
      inicio: guardado?.inicio ?? null,
      resultado,
      marca: marcaPersonal(otros),
    };
  },
  async empezarRetoSemana() {
    const reto = await apiWeb.retoSemana();
    if (!reto || reto.empezado) return reto;
    const registro = (progreso.datos().ejercicios ?? {})[reto.reto.id];
    progreso.guardarRegistro("retosSemana", reto.semana, { id: reto.reto.id, inicio: new Date().toISOString(), pistasAlEmpezar: registro?.pistasVistas ?? 0 });
    cache.clear();
    return apiWeb.retoSemana();
  },
  async planSemana() {
    const [{ debiles }, errores, reto, { preguntas }] = await Promise.all([apiWeb.mapa(), apiWeb.erroresFrecuentes(), apiWeb.retoSemana(), json("entrevistas.json")]);
    const hoy = progreso.hoy();
    const d = progreso.datos();
    const ofertas = Object.values(progreso.registros("ofertasAnalizadas"));
    return {
      semana: lunesDe(hoy),
      objetivos: planDeLaSemana({
        debiles,
        errores,
        ofertas,
        reto: reto && reto.resultado.estado !== "resuelto" ? reto.reto : null,
        tarjetasPendientes: preguntas.filter((p) => preguntaPendiente(d.preguntas?.[p.id], hoy)).length,
        meta: d.config?.metaDiaria ?? 2,
      }),
    };
  },
  /** Datos de tu CV más las habilidades que de verdad dominas (temas en verde de tu mapa). */
  async cv() {
    const { unidades } = await apiWeb.mapa();
    const config = progreso.datos().config;
    const verdes = unidades.filter((u) => u.estado === "verde");
    const NOMBRES = { javascript: "JavaScript", react: "React", typescript: "TypeScript", node: "Node.js y Express", algoritmos: "Algoritmos y estructuras de datos" };
    const habilidades = Object.entries(NOMBRES)
      .map(([area, nombre]) => ({ nombre, temas: verdes.filter((u) => u.area === area).map((u) => u.titulo) }))
      .filter((h) => h.temas.length);
    return {
      datos: progreso.ajuste("cv", { nombre: config.nombre ?? "", titular: "Desarrollador Frontend Junior", ciudad: "Lima, Perú", correo: "", telefono: "", github: "", linkedin: "", sobreMi: "", estudios: "", proyectos: [], idiomas: "Español (nativo), Inglés" }),
      habilidades,
    };
  },
  guardarCv: async (datos) => progreso.cambiarAjuste("cv", datos),
  /** Marca un proyecto de portafolio como publicado (con su enlace de GitHub o demo). */
  marcarPortafolio: async (ejercicio, datos) => progreso.guardarRegistro("portafolio", ejercicio, { exportado: true, ...datos }),
  portafolioPublicado: async () => progreso.registros("portafolio"),

  // --- Inglés ---
  /** Teoría, palabras y diálogos de cada unidad. */
  inglesUnidades: conCache("inglesUnidades", async () => (await json("ingles.json")).unidades),
  async inglesUnidad(id) {
    const unidad = (await json("ingles.json")).unidades.find((u) => u.id === id);
    if (!unidad) throw new Error("No existe esa unidad de inglés.");
    return unidad;
  },
  /** Lo de hoy en inglés: minutos (lecciones + inmersión) contra tu meta, racha y la semana. */
  async inglesHoy() {
    const dias = progreso.dias();
    const hoy = progreso.hoy();
    const minutos = (f) => Math.round(((dias[f]?.inglesSegundos ?? 0) / 60 + (dias[f]?.inmersion ?? 0)) * 10) / 10;
    const practico = (f) => (dias[f]?.ingles ?? 0) + (dias[f]?.inmersion ?? 0) > 0;
    let f = practico(hoy) ? hoy : sumarDias(hoy, -1);
    let racha = 0;
    while (practico(f)) {
      racha++;
      f = sumarDias(f, -1);
    }
    const semana = Array.from({ length: 7 }, (_, i) => sumarDias(hoy, i - 6)).map((fecha) => ({ fecha, minutos: minutos(fecha) }));
    const ajuste = progreso.ajuste("ingles", {});
    return {
      hoy,
      meta: progreso.datos().config.metaIngles ?? 15,
      minutosHoy: minutos(hoy),
      leccionesHoy: dias[hoy]?.ingles ?? 0,
      inmersionHoy: dias[hoy]?.inmersion ?? 0,
      racha,
      semana,
      nivelHecho: !!ajuste.nivelHecho,
    };
  },
  /** Historias y roleplays de todas las unidades, con cuáles ya hiciste. */
  async historiasIngles() {
    const datos = await json("historias-ingles.json").catch(() => ({ historias: [], roleplays: [] }));
    const extra = extraIngles();
    return { ...datos, hechas: extra.historias ?? {}, unidad: progreso.ajuste("ingles", {}).unidad ?? null };
  },
  /** Terminaste una historia o un roleplay: XP, cuenta para la misión y queda marcada. */
  async terminarHistoria(id, { xp = 0, segundos = 0 } = {}) {
    const extra = extraIngles();
    guardarExtra({ historias: { ...(extra.historias ?? {}), [id]: progreso.hoy() } });
    progreso.sumarContadores({ inglesHistorias: 1, inglesSegundos: Math.round(Math.min(segundos, 3600)) });
    if (xp) progreso.sumarXp(xp);
    cache.clear();
  },
  /** Lección de inglés terminada: contadores para misiones y liga. */
  async registrarLeccionIngles(sesion, final) {
    progreso.sumarContadores(contadoresDeLeccion(sesion, final));
    cache.clear();
  },
  /** Misiones de hoy, liga contra ti mismo y si ya cobraste el cofre diario. */
  async inglesMotivacion({ conMicro = false } = {}) {
    const dias = progreso.dias();
    const hoy = progreso.hoy();
    const extra = extraIngles();
    const misiones = misionesDelDia(hoy, dias[hoy] ?? {}, { conMicro });
    return { misiones, completas: misiones.every((m) => m.hecha), cobrado: extra.cofreDiario === hoy, xpCofre: XP_COFRE_DIARIO, liga: ligaSemanal(dias, hoy), vidas: !!extra.vidas, parejasRecord: extra.parejasRecord ?? 0 };
  },
  async cobrarCofreDiario() {
    const hoy = progreso.hoy();
    const extra = extraIngles();
    const dias = progreso.dias();
    if (extra.cofreDiario === hoy || !misionesDelDia(hoy, dias[hoy] ?? {}).every((m) => m.hecha)) return null;
    guardarExtra({ cofreDiario: hoy });
    progreso.sumarXp(XP_COFRE_DIARIO);
    cache.clear();
    return { xp: XP_COFRE_DIARIO };
  },
  /** Abre el cofre de una unidad terminada (todos sus conceptos aprendidos): una frase de trabajo y XP. */
  async abrirCofreUnidad(unidad) {
    const extra = extraIngles();
    const { items } = await itemsIngles();
    const premio = premioDeCofre(items, unidad);
    if ((extra.cofres ?? {})[unidad]) return { ...premio, yaAbierto: true };
    guardarExtra({ cofres: { ...(extra.cofres ?? {}), [unidad]: progreso.hoy() } });
    progreso.sumarXp(premio.xp);
    cache.clear();
    return premio;
  },
  /** Repaso legendario aprobado: la unidad queda dorada. */
  async marcarLegendaria(unidad) {
    const extra = extraIngles();
    guardarExtra({ legendarias: { ...(extra.legendarias ?? {}), [unidad]: progreso.hoy() } });
  },
  cambiarVidasIngles: async (activas) => guardarExtra({ vidas: !!activas }),
  /** Parejas contrarreloj: guarda tu récord y suma el XP. */
  async terminarParejas(parejas, xp) {
    const extra = extraIngles();
    const record = Math.max(extra.parejasRecord ?? 0, parejas);
    guardarExtra({ parejasRecord: record });
    progreso.sumarContadores({ inglesAciertos: parejas, inglesSegundos: 60 });
    if (xp) progreso.sumarXp(xp);
    cache.clear();
    return { record, nuevoRecord: parejas > (extra.parejasRecord ?? 0) };
  },
  /** Mis palabras: las que marcaste con estrella para repasarlas aparte. */
  misPalabras: async () => progreso.registros("misPalabras"),
  alternarMiPalabra: async (id) => {
    if (progreso.registros("misPalabras")[id]) progreso.borrarRegistro("misPalabras", id);
    else progreso.guardarRegistro("misPalabras", id, { fecha: progreso.hoy() });
  },
  elegirUnidadIngles: async (id) => progreso.cambiarAjuste("ingles", { ...progreso.ajuste("ingles", {}), unidad: id }),
  /** Después de la prueba de nivel: empiezas en la primera unidad donde fallaste. */
  guardarNivelIngles: async (empiezaEn) => {
    progreso.cambiarAjuste("ingles", { ...progreso.ajuste("ingles", {}), unidad: empiezaEn, nivelHecho: true });
    cache.clear();
  },
  /** Minutos de inglés real que escuchaste o leíste fuera de la app (series, videos, podcasts). */
  registrarInmersion: async (minutos, que = "") => {
    const m = Math.max(1, Math.min(240, Math.round(minutos)));
    progreso.sumarDia("inmersion", m);
    progreso.guardarRegistro("inmersion", `${progreso.hoy()}-${Date.now().toString(36)}`, { fecha: progreso.hoy(), minutos: m, que: String(que).slice(0, 80) });
    cache.clear();
  },
  guardarMetaIngles: async (minutos) => progreso.cambiarConfig({ metaIngles: minutos }),
  guardarLeccionEnCurso: async (sesion) => progreso.guardarLeccionEnCurso(sesion),

  /** Respaldo manual del progreso del celular (Ajustes). */
  exportarProgreso: () => progreso.exportar(),
  /** Borra tu progreso en todos tus dispositivos (ver empezarDeCero en progreso-movil.js). */
  empezarDeCero: async () => {
    progreso.empezarDeCero();
    cache.clear();
  },
  importarProgreso: async (texto) => {
    progreso.importar(texto);
    cache.clear();
  },
};

// En tu laptop con dev-prep abierto, la web usa ese servidor para todo lo que la app local sabe
// hacer (VS Code, tests, progreso de la laptop). Lo que solo existe en la web (lecciones,
// chuletas, respaldo) sigue saliendo de aquí.
const apiLocal = crearApi(BASE_LOCAL);
export const api = new Proxy(apiWeb, {
  get: (web, clave) => (conectada() && clave in apiLocal ? apiLocal : web)[clave],
});
