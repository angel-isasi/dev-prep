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
import { crearProgresoMovil } from "./progreso-movil.js";
import { mapaDominio, unidadesDebiles } from "../../../server/dominio.js";
import { erroresFrecuentes } from "../../../server/errores.js";
import { MAZOS, calificar as calificarTarjetaFsrs, colaDeHoy } from "../../../server/tarjetas-reglas.js";
import { calcularLogros, semaforoPostular } from "../../../server/logros.js";
import { analizarOferta, palabrasParaCv } from "../../../server/ofertas.js";
import { diaSemana, lunesDe } from "../../../server/metricas.js";
import { avanceUnidad, terminada } from "../movil/leccion/motor.js";
import { clavePrueba, planUnidad, separarBloqueadas } from "../movil/leccion/plan.js";
import { armarSesion } from "../../../server/sesion.js";
import { armarRuta } from "../../../server/ruta.js";
import { huboEstudio } from "../../../server/puntos.js";
import { preguntasDelTema } from "../../../server/centro-tema.js";
import { unidadDeEjercicio } from "../../../scripts/items/unidades.js";
import { partesTeoria } from "./teoria.js";
import { expandirIngles, registrosPorConcepto } from "../../../scripts/items/ingles.js";
import { contadoresDeLeccion, ligaSemanal, misionesDelDia, premioDeCofre, XP_COFRE_DIARIO } from "../movil/ingles/misiones.js";
import { COLECCION_EXTRA, extraDesdeRegistros, registrosDesdeViejo } from "../movil/ingles/extra.js";
import { unidadTrasExamen } from "../movil/ingles/examen.js";
import { compararAvance, marcaPersonal, planDeLaSemana, resultadoReto, retoDeLaSemana } from "../../../server/avance.js";
import { buscarOfertas, nuevasDesde, ordenarOfertas } from "../../../server/ofertas-auto.js";
import { conFechaDeEnvio, metaSemanal, numerosPostulaciones, seguimientosPendientes } from "../../../server/postulaciones.js";
import { crearApiMapache } from "../movil/mapache/api-mapache.js";
import { rachaIngles } from "../movil/mapache/reglas.js";
import { crearApi } from "./api-servidor.js";
import { BASE_LOCAL, conectada } from "./conexion-local.js";
import { ES_VISITA, almacen, crearAlmacenMemoria, progresoDeEjemplo } from "./visita.js";

// En modo visita el progreso es de ejemplo y vive en memoria: no se lee ni se toca el progreso real
export const progreso = crearProgresoMovil(ES_VISITA ? crearAlmacenMemoria() : localStorage);

// Pide a Android que no borre los datos de la app si se queda sin espacio.
navigator.storage?.persist?.().catch(() => {});

const SECCION_MODELO = "Cómo explicarlo en la entrevista";

/** Lee un JSON guardado en este dispositivo; un valor dañado cuenta como "no hay nada". */
function leerJson(clave) {
  try {
    return JSON.parse(almacen.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

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

/** Lo propio de las lecciones de inglés: historias hechas, cofres, legendarias, vidas, récords, examen (ver ingles/extra.js). */
function extraIngles() {
  // Antes todo vivía en un solo ajuste; se pasa una vez a registros sueltos y el ajuste queda vacío.
  const viejo = progreso.ajuste("inglesExtra", null);
  if (viejo && !viejo.migrado) {
    for (const [id, v] of registrosDesdeViejo(viejo)) progreso.guardarRegistro(COLECCION_EXTRA, id, { v });
    progreso.cambiarAjuste("inglesExtra", { migrado: true });
  }
  return extraDesdeRegistros(progreso.registros(COLECCION_EXTRA));
}
const marcarExtra = (id, v) => progreso.guardarRegistro(COLECCION_EXTRA, id, { v });

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
  const partes = await Promise.all(["basico", "intermedio", "trabajo", "avanzado", "superior", "dominio"].map((e) => json(`items-ingles-${e}.json`).catch(() => null)));
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
      estudiadoHoy: progreso.dias()[hoy] ?? null,
      tarjetasParaHoy: preguntas.filter((p) => preguntaPendiente(datos.preguntas[p.id], hoy)).length,
      ejerciciosParaRepasar,
      quizzesHechos: Object.keys(datos.quizzes).length,
      ...(() => {
        const g = general(ejercicios);
        // La racha es la misma en todos lados: días seguidos cumpliendo la meta (server/metricas.js)
        return { racha: g.dias.racha, juego: g.juego, meta: g.dias.hoy, salvados: g.dias.salvados, jefe: g.jefe ? { id: g.jefe.id, titulo: g.jefe.titulo } : null };
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
    const [datosItems, entrevistas, temas] = await Promise.all([ingles ? itemsIngles() : json("items.json"), ingles ? null : json("entrevistas.json"), ingles ? null : aprender().then((a) => a.temas).catch(() => [])]);
    const d = progreso.datos();
    const unidades = datosItems.unidades;
    const elegida = ingles ? progreso.ajuste("ingles", {}).unidad : d.unidadActual;
    const actual = unidades.find((u) => u.id === elegida) ?? unidades[0];
    const enCurso = d.leccionEnCurso && (d.leccionEnCurso.ambito ?? "programacion") === ambito ? d.leccionEnCurso : null;
    // Las preguntas sobre el código de un ejercicio se abren cuando lo resuelves (con la laptop
    // conectada, el estado sale de ella; si no, del progreso sincronizado)
    let libres = { items: datosItems.items, bloqueadas: {} };
    if (!ingles) {
      const resueltos = new Set((await api.ejercicios().catch(() => [])).filter((e) => e.estado === "resuelto").map((e) => e.id));
      libres = separarBloqueadas(datosItems.items, (id) => resueltos.has(id), d.items);
    }
    return {
      ambito,
      unidades,
      items: libres.items,
      bloqueadas: libres.bloqueadas,
      preguntas: entrevistas?.preguntas ?? [],
      // En inglés, el progreso viejo (una clave por forma de preguntar) se junta en su concepto
      registros: ingles ? registrosPorConcepto(d.items) : d.items,
      registrosPreguntas: d.preguntas,
      extra: ingles ? extraIngles() : null,
      reportados: d.reportados,
      unidadActual: actual?.id ?? null,
      lecciones: d.lecciones,
      // Programación: cuántos conceptos tiene la teoría de cada tema (para "3 de 7 leídos") y tus quizzes y pruebas
      teoria: ingles ? null : Object.fromEntries((temas ?? []).map((t) => [t.id, partesTeoria(t.teoria)?.conceptos.length ?? 0])),
      quizzes: ingles ? null : (d.quizzes ?? {}),
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
  /** Prueba de una unidad de programación: se guarda como un quiz más ("prueba:<unidad>", guarda tu mejor nota). */
  guardarPrueba: async (unidad, aciertos, total) => progreso.guardarQuiz(`prueba:${unidad}`, aciertos, total),
  reportar: async (clave) => progreso.reportar(clave),
  quitarReporte: async (clave) => progreso.quitarReporte(clave),
  reportados: async () => progreso.datos().reportados,
  elegirUnidad: async (id) => progreso.elegirUnidad(id),

  // --- Plan junior (server/plan-junior.js): solo se guarda cuándo empieza y cuántos días dura ---
  plan15: async () => progreso.ajuste("plan15", null),
  guardarPlan15: async (config) => {
    progreso.cambiarAjuste("plan15", config ? { inicio: config.inicio, dias: config.dias } : { inicio: null });
    cache.clear();
  },

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
  /** Modo visita: carga el contenido y arma con él un progreso de ejemplo (ver lib/visita.js). */
  async prepararVisita() {
    if (!ES_VISITA) return;
    const [{ ejercicios }, datosItems, ap, entrevistas] = await Promise.all([indice(), json("items.json"), aprender(), json("entrevistas.json")]);
    const ejemplo = progresoDeEjemplo({ hoy: progreso.hoy(), ejercicios, unidades: datosItems.unidades, items: datosItems.items, preguntas: entrevistas.preguntas, temas: ap.temas });
    progreso.importar(JSON.stringify(ejemplo));
    limpiarCache();
  },

  /**
   * Todo lo de un tema en un solo lugar (página del tema): cuánto lo dominas y qué te falta, sus
   * lecciones, los demás ejercicios de la unidad, sus términos del glosario, sus métodos de la
   * Referencia y las preguntas de entrevista que lo tocan.
   */
  async centroDelTema(id) {
    const [{ unidades }, lecc, { ejercicios }, ap, glosario, referencia, entrevistas] = await Promise.all([
      apiWeb.mapa(),
      apiWeb.lecciones(),
      indice(),
      aprender(),
      json("glosario.json"),
      json("referencia.json"),
      json("entrevistas.json"),
    ]);
    const tema = ap.porId.get(id);
    if (!tema) return null;
    const guiados = new Set(tema.ejercicios ?? []);
    const terminos = glosario.flatMap((c) => c.terminos).filter((t) => t.unidad === id);
    const idsReferencia = new Set(lecc.items.filter((it) => it.unidad === id && it.fuente?.tipo === "referencia").map((it) => it.fuente.id));
    return {
      dominio: unidades.find((u) => u.id === id) ?? null,
      plan: planUnidad(lecc.items, lecc.registros, id, lecc.reportados, lecc.bloqueadas?.[id]),
      prueba: lecc.quizzes?.[clavePrueba(id)] ?? null,
      otrosEjercicios: ejercicios.filter((e) => !guiados.has(e.id) && unidadDeEjercicio(e, ap.temas) === id).map(resumenEj),
      terminos,
      metodos: referencia.entradas.filter((e) => idsReferencia.has(e.id)),
      preguntas: preguntasDelTema(entrevistas.preguntas, { area: tema.area, titulo: tema.titulo, terminos }),
    };
  },

  /**
   * La ruta semana a semana hasta tu fecha meta: qué unidades tocan cada semana y si vas al día
   * (la regla está en server/ruta.js). Sale del mismo mapa de dominio.
   */
  async ruta() {
    const { unidades } = await apiWeb.mapa();
    const hoy = progreso.hoy();
    const dias = progreso.dias();
    const inicio = Object.keys(dias).filter((f) => huboEstudio(dias[f])).sort()[0] ?? hoy;
    return armarRuta({ hoy, fechaMeta: progreso.datos().config.fechaMeta, inicio, unidades, pausas: progreso.ajuste("pausas", { lista: [] }).lista });
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
  /**
   * La sesión de hoy: una sola lista ordenada, primero lo que toca repasar y luego lo nuevo
   * (la regla está en server/sesion.js). Reemplaza al mazo de Inicio y a la lista del celular.
   */
  async sesionDeHoy() {
    const hoy = progreso.hoy();
    const conMotor = conectada();
    // api.inicio viene de la laptop si está conectada: ahí están los ejercicios resueltos con tests
    const [inicio, { ejercicios }, lecc, ingles, { preguntas }] = await Promise.all([api.inicio(), indice(), apiWeb.lecciones(), apiWeb.inglesHoy(), json("entrevistas.json")]);
    const d = progreso.datos();
    const dia = progreso.dias()[hoy] ?? {};

    // Lo que vence hoy: preguntas de lección, tarjetas de entrevista y ejercicios (con tests o estudiados)
    const preguntasVencidas = lecc.items.filter((it) => !lecc.reportados[it.clave] && lecc.registros[it.clave]?.proximo && lecc.registros[it.clave].proximo <= hoy).length;
    const tarjetasVencidas = preguntas.filter((p) => preguntaPendiente(d.preguntas[p.id], hoy)).length;
    const estudiados = ejercicios.filter((e) => progreso.estadoLectura(e.id) === "repasar").map((e) => ({ id: e.id, titulo: e.titulo }));
    const paraRepasar = [...inicio.repasos, ...estudiados.filter((e) => !inicio.repasos.some((r) => r.id === e.id))];

    // Lo nuevo: tu siguiente lección (o la que dejaste a medias) y tu siguiente ejercicio
    const unidad = lecc.unidades.find((u) => u.id === lecc.unidadActual) ?? lecc.unidades[0];
    const plan = unidad ? planUnidad(lecc.items, lecc.registros, unidad.id, lecc.reportados, lecc.bloqueadas?.[unidad.id]) : null;
    const leccion =
      lecc.enCurso && !terminada(lecc.enCurso)
        ? { titulo: "la que dejaste a medias", unidad: unidad?.titulo ?? "", a: "/leccion?retomar=1" }
        : plan?.siguiente
          ? { titulo: plan.siguiente.nombre, unidad: unidad.titulo, a: `/leccion?unidad=${encodeURIComponent(unidad.id)}&parte=${plan.siguiente.id}` }
          : null;
    const proximo = inicio.continuar ?? inicio.siguiente;

    return armarSesion({
      meta: inicio.meta,
      dia,
      repaso: { preguntas: preguntasVencidas, tarjetas: tarjetasVencidas, ejercicios: paraRepasar },
      nuevo: { leccion, ejercicio: proximo && !paraRepasar.some((r) => r.id === proximo.id) ? { id: proximo.id, titulo: proximo.titulo } : null, continuar: !!inicio.continuar },
      ingles: { meta: ingles.meta, minutosHoy: ingles.minutosHoy },
      finDeSemana: diaSemana(hoy) >= 5,
      examenHecho: !!progreso.registros("examenes")[lunesDe(hoy)],
      diarioHecho: !!progreso.registros("diario")[hoy],
      conMotor,
      memoria: colaDeHoy(Object.values(progreso.registros("tarjetas")), { hoy, hechasHoy: { nuevas: dia.tarjetasNuevas ?? 0, repasos: dia.tarjetasRepasos ?? 0 } }).cola.length,
    });
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
  /** Tu plan de la semana armado con la IA (Hoy > Tu semana). */
  /** Examen mensual de preparación (Entrevistas > Con IA): { "YYYY-MM": { puntaje, nivel, resumen, fecha } }. */
  examenesMes: async () => progreso.ajuste("examenesMes", {}),
  guardarExamenMes: async (mes, r) => progreso.cambiarAjuste("examenesMes", { ...progreso.ajuste("examenesMes", {}), [mes]: r }),
  planSemanaIa: async () => progreso.ajuste("planSemanaIa", null),
  guardarPlanSemanaIa: async (plan) => progreso.cambiarAjuste("planSemanaIa", plan),
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
    const guardada = leerJson(CLAVE);
    const fresca = guardada && Date.now() - Date.parse(guardada.buscadoEn) < 3 * 60 * 60 * 1000;
    let busqueda = !nuevo && fresca ? guardada : null;
    if (!busqueda) {
      try {
        busqueda = conectada()
          ? await apiLocal.buscarOfertasMotor(nuevo)
          : { ...(await buscarOfertas(fetch, { soloNavegador: true })), buscadoEn: new Date().toISOString() };
        almacen.setItem(CLAVE, JSON.stringify(busqueda));
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
    const vistas = leerJson(CLAVE_VISTAS);
    if (vistasAlAbrir === undefined) vistasAlAbrir = vistas;
    const nuevas = new Set(nuevasDesde(ids, vistasAlAbrir));
    almacen.setItem(CLAVE_VISTAS, JSON.stringify([...new Set([...ids, ...(vistas ?? [])])].slice(0, 2000)));

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
    // La misma racha de inglés que usa el mapache (cuenta cualquier práctica, también con él)
    const racha = rachaIngles(dias, hoy);
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
    marcarExtra(`historia:${id}`, progreso.hoy());
    progreso.sumarContadores({ inglesHistorias: 1, inglesSegundos: Math.round(Math.min(segundos, 3600)) });
    if (xp) progreso.sumarXp(xp);
    cache.clear();
  },
  /** Charla con IA terminada: el tiempo cuenta para tus minutos de inglés de hoy. */
  async terminarConversacion({ xp = 0, segundos = 0 } = {}) {
    progreso.sumarContadores({ inglesSegundos: Math.round(Math.max(0, Math.min(segundos, 3600))) });
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
  async cobrarCofreDiario({ conMicro = false } = {}) {
    const hoy = progreso.hoy();
    const extra = extraIngles();
    const dias = progreso.dias();
    if (extra.cofreDiario === hoy || !misionesDelDia(hoy, dias[hoy] ?? {}, { conMicro }).every((m) => m.hecha)) return null;
    marcarExtra("cofreDiario", hoy);
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
    marcarExtra(`cofre:${unidad}`, progreso.hoy());
    progreso.sumarXp(premio.xp);
    cache.clear();
    return premio;
  },
  /** Repaso legendario aprobado: la unidad queda dorada. */
  async marcarLegendaria(unidad) {
    marcarExtra(`legendaria:${unidad}`, progreso.hoy());
  },
  cambiarVidasIngles: async (activas) => marcarExtra("vidas", !!activas),
  /** Examen de nivel terminado: las unidades anteriores quedan hechas y tu unidad actual pasa a donde llegaste. */
  async guardarExamenIngles(r, segundos = 0) {
    marcarExtra("examen", { hasta: r.hasta, todas: r.todas, nivel: r.nivel, dominadas: r.dominadas, aciertos: r.aciertos, total: r.total, fecha: progreso.hoy() });
    // Repetir el examen no te retrocede: si ya ibas más adelante estudiando, te quedas ahí
    const ajuste = progreso.ajuste("ingles", {});
    const orden = (await itemsIngles()).unidades.map((u) => u.id);
    progreso.cambiarAjuste("ingles", { ...ajuste, unidad: unidadTrasExamen(orden, ajuste.unidad, r.hasta), nivelHecho: true });
    progreso.sumarContadores({ inglesSegundos: Math.round(Math.min(segundos, 3600)) });
    cache.clear();
  },
  /** Parejas contrarreloj: guarda tu récord y suma el XP. */
  async terminarParejas(parejas, xp, segundos = 60) {
    const extra = extraIngles();
    const record = Math.max(extra.parejasRecord ?? 0, parejas);
    marcarExtra("parejasRecord", record);
    progreso.sumarContadores({ inglesAciertos: parejas, inglesSegundos: Math.round(Math.max(0, Math.min(segundos, 60))) });
    if (xp) progreso.sumarXp(xp);
    cache.clear();
    return { record, nuevoRecord: parejas > (extra.parejasRecord ?? 0) };
  },
  // El mapache de inglés (ver movil/mapache/): lee tu progreso de inglés y guarda lo suyo en inglesExtra
  ...crearApiMapache({ progreso, itemsIngles, json, extraIngles, limpiar: () => cache.clear() }),
  // --- Tarjetas de memoria (estilo Anki, ver server/tarjetas-reglas.js) ---
  /** Todas tus tarjetas, de la más nueva a la más vieja. */
  misTarjetas: async () =>
    Object.entries(progreso.registros("tarjetas"))
      .map(([id, t]) => ({ ...t, id }))
      .sort((a, b) => String(b.creada).localeCompare(String(a.creada))),
  /** La cola de hoy (con topes) y cuántas hiciste. @param {string} [mazo] */
  colaTarjetas: async (mazo) => {
    const hoy = progreso.hoy();
    const dia = progreso.dias()[hoy] ?? {};
    const hechasHoy = { nuevas: dia.tarjetasNuevas ?? 0, repasos: dia.tarjetasRepasos ?? 0 };
    const todas = Object.entries(progreso.registros("tarjetas")).map(([id, t]) => ({ ...t, id }));
    return { ...colaDeHoy(todas, { hoy, mazo, hechasHoy }), hechasHoy, total: todas.length, hoy };
  },
  /** Crea o edita una tarjeta: { id?, mazo, frente, reverso, ejemplo?, origen? }. */
  guardarTarjeta: async (t) => {
    const id = t.id ?? `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const previa = progreso.registros("tarjetas")[id];
    const limpia = {
      mazo: MAZOS[t.mazo] ? t.mazo : "js",
      frente: String(t.frente ?? "").trim().slice(0, 600),
      reverso: String(t.reverso ?? "").trim().slice(0, 1200),
      ejemplo: String(t.ejemplo ?? "").trim().slice(0, 600),
      origen: String(t.origen ?? previa?.origen ?? "").slice(0, 80),
      creada: previa?.creada ?? new Date().toISOString(),
      rep: previa?.rep ?? null,
    };
    if (!limpia.frente || !limpia.reverso) throw new Error("La tarjeta necesita pregunta y respuesta.");
    progreso.guardarRegistro("tarjetas", id, limpia);
    return { ...limpia, id };
  },
  borrarTarjeta: async (id) => progreso.borrarRegistro("tarjetas", id),
  /** Calificas una tarjeta (1 a 4): FSRS decide cuándo vuelve. */
  calificarTarjeta: async (id, nota) => {
    const t = progreso.registros("tarjetas")[id];
    if (!t) throw new Error("Esa tarjeta ya no existe.");
    const { en: _en, ...resto } = t;
    const rep = calificarTarjetaFsrs(t.rep, nota, progreso.hoy());
    progreso.guardarRegistro("tarjetas", id, { ...resto, rep });
    progreso.sumarDia(t.rep ? "tarjetasRepasos" : "tarjetasNuevas");
    cache.clear();
    return rep;
  },
  /** Mis palabras: las que marcaste con estrella para repasarlas aparte. */
  misPalabras: async () => progreso.registros("misPalabras"),
  alternarMiPalabra: async (id) => {
    if (progreso.registros("misPalabras")[id]) progreso.borrarRegistro("misPalabras", id);
    else progreso.guardarRegistro("misPalabras", id, { fecha: progreso.hoy() });
  },
  /** Aprobaste la prueba de una unidad de inglés: queda hecha y, si era la tuya, pasas a la siguiente. */
  async saltarUnidadIngles(unidad) {
    marcarExtra(`saltada:${unidad}`, progreso.hoy());
    const ajuste = progreso.ajuste("ingles", {});
    const orden = (await itemsIngles()).unidades.map((u) => u.id);
    const actual = ajuste.unidad ?? orden[0];
    const sigue = orden[orden.indexOf(unidad) + 1];
    if (actual === unidad && sigue) progreso.cambiarAjuste("ingles", { ...ajuste, unidad: sigue });
    cache.clear();
    return sigue ?? null;
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
