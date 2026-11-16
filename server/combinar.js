// Mezcla del progreso entre dispositivos (laptop y celular), como funciones puras.
// La usan el servidor de la laptop (server/sync.js) y el celular (client/src/lib/sync-movil.js).
//
// Idea: cada dispositivo guarda primero en sí mismo y sube SU documento a la nube. Al bajar los
// documentos de los otros, los mezcla con el suyo registro por registro:
// - Tarjetas, ítems de lección, lecturas, ejercicios: gana el registro más reciente.
// - Quizzes: el mejor resultado.
// - Días (racha, meta): cada dispositivo cuenta lo suyo y se SUMAN (nunca se pisan).
// Mezclar dos veces lo mismo da el mismo resultado, así que repetir una sincronización no daña nada.

/** Fecha y hora de un registro, para saber cuál es más reciente (ms desde 1970, o null). */
export function fechaDe(registro) {
  const texto = registro?.en ?? registro?.ultimaActividad ?? registro?.resueltoEn ?? registro?.actualizadoEn ?? null;
  const ms = texto ? Date.parse(texto) : NaN;
  return Number.isNaN(ms) ? null : ms;
}

/** El más reciente de dos registros del mismo elemento. Sin fechas, el que tiene más uso. */
export function masReciente(a, b) {
  if (!a) return b;
  if (!b) return a;
  const fa = fechaDe(a);
  const fb = fechaDe(b);
  if (fa !== null && fb !== null) return fb > fa ? b : a;
  if (fa === null && fb !== null) return b;
  if (fb === null && fa !== null) return a;
  return (b.vistas ?? b.intentos ?? 0) > (a.vistas ?? a.intentos ?? 0) ? b : a;
}

/** Mezcla dos mapas id -> registro eligiendo con `elegir`. */
function mezclarMapa(propio = {}, remoto = {}, elegir = masReciente) {
  const resultado = { ...propio };
  for (const [id, registro] of Object.entries(remoto)) resultado[id] = elegir(propio[id], registro);
  return resultado;
}

/**
 * Colecciones de registros sueltos (postulaciones, simulacros, ajustes...): un mapa id -> registro
 * con su fecha `en`. Gana el más reciente. Borrar deja una lápida { borrado: true, en } para que
 * lo borrado no "resucite" al mezclar con un dispositivo que todavía lo tiene.
 */
export const REGISTROS = [
  "ajustes",
  "postulaciones",
  "preguntasPropias",
  "portafolio",
  "simulacros",
  "examenes",
  "diario",
  "logrosVistos",
  "inmersion",
  "misPalabras",
  "revisiones",
  "explicaciones",
  "retosSemana",
  "ofertasAnalizadas",
  "ofertasMarcadas",
  "git",
];

/** Mezcla dos colecciones de registros (ver REGISTROS). */
export const mezclarRegistros = (propio, remoto) => mezclarMapa(propio, remoto, masReciente);

/** Los registros de una colección sin los borrados. */
export const vivos = (coleccion) => Object.fromEntries(Object.entries(coleccion ?? {}).filter(([, r]) => r && !r.borrado));

/** Ejercicios: el más reciente, pero un "resuelto" (tests en la laptop) nunca se pierde. */
function elegirEjercicio(a, b) {
  const elegido = masReciente(a, b);
  const otro = elegido === a ? b : a;
  if (otro?.estado === "resuelto" && elegido?.estado !== "resuelto" && elegido?.estado !== "repasar") return otro;
  return elegido;
}

/** Quizzes: el mejor resultado; el "último" sale del más reciente. */
function elegirQuiz(a, b) {
  if (!a) return b;
  if (!b) return a;
  const reciente = masReciente(a, b);
  return { ...reciente, mejor: Math.max(a.mejor ?? 0, b.mejor ?? 0) };
}

// ---------------------------------------------------------------------------
// Empezar de cero: una marca de reinicio que viaja en `ajustes.reinicio` ({ id, en }).
// Cada documento lleva la `epoca` (el id del último reinicio que aplicó). Al mezclar:
// - si TU documento es de una época anterior, se vacía (conservando ajustes, config y tus textos);
// - si el documento del OTRO dispositivo es de una época anterior, su progreso se ignora.
// Así lo viejo no vuelve aunque un celular sin internet todavía lo tenga guardado.
// ---------------------------------------------------------------------------

/** El reinicio más reciente que conocen estos documentos (o null). */
export function reinicioVigente(...docs) {
  return docs.map((d) => vivos(d?.ajustes).reinicio).reduce((a, b) => masReciente(a, b) ?? null, null);
}

/** El progreso vacío de un documento: se quedan solo los ajustes, la configuración y tus textos. */
export function vaciarProgreso(doc, epoca) {
  const { version, config, ajustes, misRespuestas, reportados } = doc ?? {};
  return {
    version: version ?? 1,
    config: config ?? {},
    ajustes: ajustes ?? {},
    misRespuestas: misRespuestas ?? { pitch: "", historias: [], respuestas: {} },
    reportados: reportados ?? {},
    ejercicios: {},
    preguntas: {},
    quizzes: {},
    dias: {},
    items: {},
    lecturas: {},
    epoca,
  };
}

/** Aplica el reinicio vigente a tu documento si todavía no lo aplicó. */
export function aplicarReinicio(doc, reinicio = reinicioVigente(doc)) {
  if (!reinicio?.id || doc?.epoca === reinicio.id) return doc;
  return vaciarProgreso(doc, reinicio.id);
}

/**
 * Mezcla en `propio` el documento de otro dispositivo. Devuelve un documento nuevo.
 * @param {object} propio     tu progreso
 * @param {object} remoto     el documento que subió el otro dispositivo
 * @param {string} dispositivo  id del otro dispositivo
 */
export function fusionarDocumento(propio, remoto, dispositivo) {
  if (!remoto || typeof remoto !== "object") return propio;
  const reinicio = reinicioVigente(propio, remoto);
  propio = aplicarReinicio(propio, reinicio);
  // Un documento de antes del reinicio solo aporta sus ajustes y textos, no su progreso viejo
  const r = reinicio?.id && remoto.epoca !== reinicio.id ? vaciarProgreso(remoto, remoto.epoca) : remoto;
  const resultado = {
    ...propio,
    preguntas: mezclarMapa(propio.preguntas, r.preguntas),
    items: mezclarMapa(propio.items, r.items),
    lecturas: mezclarMapa(propio.lecturas, r.lecturas),
    quizzes: mezclarMapa(propio.quizzes, r.quizzes, elegirQuiz),
    ejercicios: mezclarMapa(propio.ejercicios, r.ejercicios, elegirEjercicio),
    reportados: { ...(r.reportados ?? {}), ...(propio.reportados ?? {}) },
    ...Object.fromEntries(
      REGISTROS.filter((c) => propio[c] || r[c]).map((c) => [c, mezclarRegistros(propio[c], r[c])]),
    ),
    // Días: lo del otro dispositivo se guarda aparte y se suma al mostrar (ver diasCombinados).
    diasRemotos: { ...(propio.diasRemotos ?? {}), [dispositivo]: r.dias ?? {} },
  };

  // Configuración y textos personales: gana lo editado más recientemente.
  if (r.config && (fechaDe(r.config) ?? 0) > (fechaDe(propio.config) ?? 0)) {
    const { tema: _tema, ...compartida } = r.config; // el tema claro/oscuro es de cada dispositivo
    resultado.config = { ...propio.config, ...compartida };
  }
  // Si este dispositivo nunca escribió su pitch o sus historias, recibe los del otro aunque no tengan fecha.
  const sinRespuestas = !propio.misRespuestas || (!propio.misRespuestas.pitch && !propio.misRespuestas.historias?.length);
  if (r.misRespuestas && (sinRespuestas || (fechaDe(r.misRespuestas) ?? 0) > (fechaDe(propio.misRespuestas) ?? 0))) {
    resultado.misRespuestas = r.misRespuestas;
  }
  // Lecciones (solo en el celular): el contador más avanzado.
  if (r.lecciones && (r.lecciones.completadas ?? 0) > (propio.lecciones?.completadas ?? 0)) {
    resultado.lecciones = r.lecciones;
  }
  return resultado;
}

/** Días de todos los dispositivos sumados (para racha, meta y semana). */
export function diasCombinados(doc) {
  const total = {};
  const sumar = (dias) => {
    for (const [fecha, dia] of Object.entries(dias ?? {})) {
      const acumulado = (total[fecha] ??= {});
      for (const [campo, valor] of Object.entries(dia ?? {})) {
        if (typeof valor !== "number") continue;
        // La foto del % de preparación no se suma: se toma la mayor.
        acumulado[campo] = campo === "preparacion" ? Math.max(acumulado[campo] ?? 0, valor) : (acumulado[campo] ?? 0) + valor;
      }
    }
  };
  sumar(doc.dias);
  for (const dias of Object.values(doc.diasRemotos ?? {})) sumar(dias);
  return total;
}

/** Lo que un dispositivo sube a la nube: su progreso sin lo que bajó de otros ni lo pasajero. */
export function documentoParaSubir(doc) {
  const { diasRemotos: _r, leccionEnCurso: _l, ...propio } = doc;
  return propio;
}
