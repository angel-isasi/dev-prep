// Cómo se organiza una unidad de programación en lecciones cortas, como funciones puras (plan.test.js).
//
// Una unidad tiene cientos de ítems (preguntas de su tema, de los ejercicios y de la referencia de
// métodos). En vez de soltarlos de a pocos sin que se note el avance, se reparten en lecciones fijas de
// unas 8 preguntas, agrupadas por de dónde salen, y cada una tiene nombre:
//   - Lo esencial: las ideas del tema, su vocabulario y "lee y predice".
//   - Con código real: huecos, orden y errores sacados de los ejercicios.
//   - Métodos a fondo (opcional): qué hace y qué devuelve cada método de la referencia.
// Una lección está hecha cuando respondiste todas sus preguntas al menos una vez; la unidad está
// completa con todas las de Lo esencial y Con código real. Nada se guarda aparte: todo sale de los
// registros de cada ítem, así que funciona con el progreso que ya tienes.

/** Tamaño ideal de una lección y el máximo para no partir un grupo (un método, un ejercicio). */
export const TAMANO_PARTE = 8;
export const MAXIMO_PARTE = 10;
/** Unos 20 segundos por pregunta. */
export const minutosDe = (preguntas) => Math.max(1, Math.round((preguntas * 20) / 60));
/** La prueba de la unidad: preguntas y nota para aprobarla. */
export const PRUEBA = { preguntas: 12, aprobar: 0.8 };
export const clavePrueba = (unidad) => `prueba:${unidad}`;

export const GRUPOS = [
  { id: "esencial", titulo: "Lo esencial", texto: "Las ideas del tema, su vocabulario y predecir qué hace el código.", de: (it) => it.fuente?.tipo === "tema" || it.fuente?.tipo === "glosario" || !it.fuente },
  { id: "codigo", titulo: "Con código real", texto: "Completar, ordenar y encontrar errores en código de los ejercicios.", de: (it) => it.fuente?.tipo === "ejercicio" },
  { id: "metodos", titulo: "Métodos a fondo", texto: "Qué hace y qué devuelve cada método. Opcional: no hace falta para completar la unidad.", opcional: true, de: (it) => it.fuente?.tipo === "referencia" },
];

/** Etiqueta de cada pregunta para nombrar la lección. */
function etiqueta(it) {
  if (it.tipo === "emparejar" && it.fuente?.tipo === "referencia") return null; // "une los pares" de varios métodos: ya los nombran los demás
  if (it.subtipo === "predice") return "Predice el resultado";
  if (it.fuente?.tipo === "glosario") return "Vocabulario";
  if (it.fuente?.tipo === "tema" || !it.fuente) return "Ideas del tema";
  return it.fuente.titulo ?? it.fuente.id;
}

/** Sin el prefijo largo de los métodos: "String.prototype.slice()" pasa a "slice()". */
const corto = (t) => String(t).replace(/^(String|Array|Number|Object|Promise|Element|Node|EventTarget|Document).prototype./, "");

/** "A", "A · B", "A · B · C", "A · B y 2 más" (con " · " porque los títulos ya llevan "y"). */
export function nombreDe(etiquetas) {
  const unicas = [...new Set(etiquetas.filter(Boolean).map(corto))];
  if (unicas.length <= 1) return unicas[0] ?? "Lección";
  if (unicas.length <= 3) return unicas.join(" · ");
  return `${unicas.slice(0, 2).join(" · ")} y ${unicas.length - 2} más`;
}

/**
 * Reparte los ítems en lecciones sin partir los grupos chicos (las preguntas de un mismo método o
 * ejercicio van juntas). Un grupo grande se corta en trozos de TAMANO_PARTE.
 */
export function empaquetar(items) {
  const grupos = new Map();
  for (const it of items) {
    const k = it.subtipo === "predice" ? "predice" : it.fuente?.tipo === "glosario" ? "glosario" : `${it.fuente?.tipo}:${it.fuente?.id}`;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(it);
  }
  const partes = [];
  let actual = [];
  const cerrar = () => {
    if (actual.length) partes.push(actual);
    actual = [];
  };
  for (const g of grupos.values()) {
    let resto = g;
    while (resto.length) {
      if (actual.length + resto.length <= MAXIMO_PARTE) {
        actual.push(...resto);
        resto = [];
      } else if (actual.length >= TAMANO_PARTE / 2) {
        cerrar();
      } else {
        const cabe = TAMANO_PARTE - actual.length;
        actual.push(...resto.slice(0, cabe));
        resto = resto.slice(cabe);
        cerrar();
      }
      if (actual.length >= TAMANO_PARTE) cerrar();
    }
  }
  cerrar();
  // Una última lección muy corta se junta con la anterior
  if (partes.length > 1 && partes.at(-1).length < 3) partes.at(-2).push(...partes.pop());
  return partes;
}

/** Cómo vas en un conjunto de ítems. */
export function estadoDe(items, registros, reportados = {}) {
  const validos = items.filter((it) => !reportados[it.clave]);
  const r = (it) => registros[it.clave];
  const vistos = validos.filter(r).length;
  const aprendidos = validos.filter((it) => (r(it)?.caja ?? 0) >= 1 && r(it)?.ultima !== "no").length;
  const fijados = validos.filter((it) => (r(it)?.caja ?? 0) >= 3).length;
  const errores = validos.filter((it) => r(it)?.ultima === "no").length;
  const total = validos.length;
  return { total, vistos, aprendidos, fijados, errores, hecha: total > 0 && vistos === total };
}

/**
 * El plan de una unidad: sus grupos con sus lecciones, el avance y la siguiente lección que toca.
 * @param {object[]} items       todos los ítems (items.json)
 * @param {object} registros     progreso por clave
 * @param {string} unidad
 * @param {object} [reportados]
 */
export function planUnidad(items, registros, unidad, reportados = {}) {
  const deUnidad = items.filter((it) => it.unidad === unidad);
  const grupos = GRUPOS.map((g) => {
    const suyos = deUnidad.filter(g.de);
    const lecciones = empaquetar(suyos).map((lista, i) => ({
      id: `${g.id}-${i + 1}`,
      grupo: g.id,
      numero: i + 1,
      nombre: nombreDe(lista.map(etiqueta)),
      claves: lista.map((it) => it.clave),
      preguntas: lista.length,
      minutos: minutosDe(lista.length),
      ...estadoDe(lista, registros, reportados),
    }));
    return { id: g.id, titulo: g.titulo, texto: g.texto, opcional: !!g.opcional, lecciones, hechas: lecciones.filter((l) => l.hecha).length };
  }).filter((g) => g.lecciones.length);

  const todas = grupos.flatMap((g) => g.lecciones);
  const requeridas = grupos.filter((g) => !g.opcional).flatMap((g) => g.lecciones);
  const opcionales = grupos.filter((g) => g.opcional).flatMap((g) => g.lecciones);
  const hechas = requeridas.filter((l) => l.hecha).length;
  const itemsRequeridos = deUnidad.filter((it) => !GRUPOS.find((g) => g.opcional && g.de(it)));
  const avance = estadoDe(itemsRequeridos, registros, reportados);
  const completa = requeridas.length > 0 && hechas === requeridas.length;
  const dominada = completa && avance.total > 0 && avance.fijados / avance.total >= 0.8;
  const empezada = todas.some((l) => l.vistos > 0);
  // La siguiente: la primera a medias, si no la primera sin hacer; luego las opcionales
  const siguiente =
    requeridas.find((l) => l.vistos > 0 && !l.hecha) ?? requeridas.find((l) => !l.hecha) ?? opcionales.find((l) => l.vistos > 0 && !l.hecha) ?? opcionales.find((l) => !l.hecha) ?? null;
  return {
    unidad,
    grupos,
    total: requeridas.length,
    hechas,
    porcentaje: requeridas.length ? hechas / requeridas.length : 0,
    opcionales: { total: opcionales.length, hechas: opcionales.filter((l) => l.hecha).length },
    preguntas: avance, // { total, vistos, aprendidos, fijados, errores } de lo requerido
    completa,
    dominada,
    estado: dominada ? "dominada" : completa ? "completa" : empezada ? "empezada" : "nueva",
    siguiente,
  };
}

/** Busca una lección por id ("esencial-2") en el plan de su unidad. */
export const leccionDe = (plan, id) => plan.grupos.flatMap((g) => g.lecciones).find((l) => l.id === id) ?? null;

/** La lección que viene después de otra (en su mismo grupo y luego en los siguientes), o null. */
export function despuesDe(plan, id) {
  const todas = plan.grupos.flatMap((g) => g.lecciones);
  const i = todas.findIndex((l) => l.id === id);
  return todas.slice(i + 1).find((l) => !l.hecha) ?? null;
}

/** ¿Aprobó la prueba de la unidad? (registro de quizzes: { mejor, total }) */
export const pruebaAprobada = (registro) => !!registro && registro.total > 0 && registro.mejor / registro.total >= PRUEBA.aprobar;
