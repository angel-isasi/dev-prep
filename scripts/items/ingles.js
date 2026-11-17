// Ítems de lección de la sección Inglés, generados del contenido de content/ingles (docs/guia-ingles.md).
// Van en su propio archivo (items-ingles-<etapa>.json) para no cargar las lecciones de programación con ellos.
//
// Un ítem es un CONCEPTO (una palabra, una frase, un calco...) que se domina una sola vez, aunque
// se pregunte de muchas formas. Cada concepto trae sus "variantes" ordenadas por nivel: al principio
// lo reconoces (nivel 0), luego lo produces con ayuda (1), luego sin ayuda (2 y 3). El motor elige la
// variante según la caja de repaso del concepto (client/src/movil/leccion/variantes.js).
//
// Conceptos que salen de cada unidad:
// - palabra   clave en:<id>    significado (0), oír la palabra (1), "¿cómo se dice?" (1), escribirla (2)
// - frase     clave fr:<id>    escuchar (0), completar el hueco (0), traducir con fichas (1), dictado (2),
//                              decirla en voz alta (2), traducir escribiendo (3)
// - gramática clave gra:<id>   la pregunta de la unidad
// - diálogo   clave dia:<id>:<n>
// - calco     clave cal:<id>   ¿cuál suena natural?
// - par       clave oido:<id>  pares mínimos: ¿qué palabra escuchaste?
// Claves viejas (enr:, esc:, arm:, dic:) se juntan con su concepto al leer el progreso (conceptoDeClave).

const normal = (t) => String(t ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const sinSigno = (t) => String(t).replace(/[.,!?;:"]/g, "");

/** Generador pseudoaleatorio estable (mismo contenido, mismos distractores en cada exportación). */
function azarDe(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h ^= h >>> 13;
    return (h >>> 0) / 4294967296;
  };
}

function barajar(lista, azar) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** La correcta más 3 distractores distintos entre sí y de la correcta; la correcta en un lugar estable. */
function armarOpciones(correcta, candidatos, azar, cuantos = 3) {
  const usadas = new Set([normal(correcta)]);
  const distractores = [];
  for (const c of barajar(candidatos, azar)) {
    if (distractores.length >= cuantos) break;
    if (!c || usadas.has(normal(c))) continue;
    usadas.add(normal(c));
    distractores.push(c);
  }
  if (distractores.length < 2) return null;
  const opciones = barajar([correcta, ...distractores], azar);
  return { opciones, correcta: opciones.indexOf(correcta) };
}

/** Palabras de una frase para armarla (sin signos; las contracciones quedan enteras). */
export const fichasDe = (frase) => sinSigno(frase).split(/\s+/).filter(Boolean);

/** ¿La frase armada es la correcta? Sin importar mayúsculas ni signos. */
export const armadoCorrecto = (item, elegidas) => normal(elegidas.join(" ")) === normal(item.respuesta.join(" "));

// --- Escribir y hablar: corrección tolerante ---

const CONTRACCIONES = {
  "i'm": "i am", "you're": "you are", "we're": "we are", "they're": "they are", "he's": "he is", "she's": "she is",
  "it's": "it is", "that's": "that is", "there's": "there is", "what's": "what is", "where's": "where is", "who's": "who is",
  "let's": "let us", "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
  "i'll": "i will", "you'll": "you will", "we'll": "we will", "they'll": "they will", "it'll": "it will", "i'd": "i would",
  "you'd": "you would", "don't": "do not", "doesn't": "does not", "didn't": "did not", "isn't": "is not", "aren't": "are not",
  "wasn't": "was not", "weren't": "were not", "can't": "cannot", "couldn't": "could not", "won't": "will not",
  "wouldn't": "would not", "shouldn't": "should not", "haven't": "have not", "hasn't": "has not", "hadn't": "had not",
};

/** Texto comparable: minúsculas, sin signos, contracciones expandidas, espacios simples. */
export function comparable(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:"()¿¡]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => CONTRACCIONES[p] ?? p)
    .join(" ")
    .replace(/\bcan not\b/g, "cannot");
}

/** Distancia de edición (cuántas letras hay que cambiar). */
export function distancia(a, b) {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let previo = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = fila[j];
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, previo + (a[i - 1] === b[j - 1] ? 0 : 1));
      previo = temp;
    }
  }
  return fila[b.length];
}

/**
 * ¿Lo que escribiste es correcto? "exacta", "casi" (un error de tipeo) o false.
 * @param {{ respuesta: string, aceptadas?: string[] }} item
 */
export function escrituraCorrecta(item, texto) {
  const tuyo = comparable(texto);
  if (!tuyo) return false;
  const validas = [item.respuesta, ...(item.aceptadas ?? [])].map(comparable);
  if (validas.includes(tuyo)) return "exacta";
  const tolerancia = (t) => (t.length < 5 ? 0 : Math.max(1, Math.floor(t.length / 14)));
  return validas.some((v) => distancia(tuyo, v) <= tolerancia(v)) ? "casi" : false;
}

/**
 * ¿Dijiste la frase? El reconocimiento de voz devuelve varias opciones: basta con que una
 * tenga al menos el 80% de las palabras en orden (perdona una palabra que no entendió).
 */
export function hablaCorrecta(texto, transcripciones) {
  const objetivo = comparable(texto).split(" ");
  return transcripciones.some((t) => {
    const dicho = comparable(t).split(" ");
    // palabras del objetivo encontradas en orden
    let j = 0;
    let encontradas = 0;
    for (const palabra of objetivo) {
      const k = dicho.indexOf(palabra, j);
      if (k >= 0) {
        encontradas++;
        j = k + 1;
      }
    }
    return encontradas / objetivo.length >= 0.8;
  });
}

/** La clave del concepto al que pertenece una clave de ítem (incluidas las viejas). */
export function conceptoDeClave(clave) {
  if (clave.startsWith("enr:")) return `en:${clave.slice(4)}`;
  if (/^(esc|arm|dic):/.test(clave)) return `fr:${clave.slice(4)}`;
  return clave;
}

/**
 * Junta los registros viejos (una clave por forma de preguntar) en el registro de su concepto:
 * se queda la caja más alta y la fecha de repaso más próxima. No cambia nada guardado.
 */
export function registrosPorConcepto(registros) {
  const resultado = { ...registros };
  for (const [clave, r] of Object.entries(registros ?? {})) {
    const concepto = conceptoDeClave(clave);
    if (concepto === clave || !r) continue;
    const actual = resultado[concepto];
    if (!actual) resultado[concepto] = r;
    else if (!registros[concepto]) {
      // solo mezcla viejos entre sí; si el concepto ya tiene registro propio, ese manda
      resultado[concepto] = { ...actual, caja: Math.max(actual.caja ?? 0, r.caja ?? 0), proximo: [actual.proximo, r.proximo].filter(Boolean).sort()[0] };
    }
  }
  return resultado;
}

/** Elige la palabra que se tapa en "completa la frase": la más larga que sea vocabulario de la unidad. */
function palabraParaHueco(tokens, vocabulario) {
  const candidatos = tokens.map((t, i) => ({ t, i })).filter(({ t }) => /^[a-z]/i.test(t) && t.length > 2);
  if (!candidatos.length) return null;
  const delVocabulario = candidatos.filter(({ t }) => vocabulario.has(normal(t)));
  const lista = delVocabulario.length ? delVocabulario : candidatos;
  return lista.reduce((a, b) => (b.t.length > a.t.length ? b : a));
}

/**
 * @param {object[]} unidades  de cargarIngles (server/ingles.js)
 * @returns {{ unidades: object[], items: object[] }}
 */
export function generarItemsIngles(unidades) {
  const items = [];
  const listaUnidades = unidades.map((u, i) => ({
    id: u.id,
    titulo: u.titulo,
    area: "ingles",
    etapa: u.etapa,
    nivel: u.nivel,
    descripcion: u.descripcion ?? "",
    orden: i + 1,
    conTeoria: !!u.teoria,
    historias: (u.historias ?? []).length,
    roleplays: (u.roleplays ?? []).length,
  }));

  for (const u of unidades) {
    const base = { unidad: u.id }; // la fuente se agrega al cargar (expandirIngles)
    const azar = azarDe(u.id);
    const otrasPalabras = u.palabras;
    const vocabulario = new Set(u.palabras.map((p) => normal(p.en)));
    const sueltas = u.palabras.filter((p) => !/\s/.test(p.en)).map((p) => p.en);

    // Palabras (compactas: las variantes se arman al cargar, ver expandirIngles)
    for (const p of u.palabras) {
      const mismoTipo = otrasPalabras.filter((o) => o !== p && o.tipo === p.tipo);
      const pool = mismoTipo.length >= 3 ? mismoTipo : otrasPalabras.filter((o) => o !== p);
      const significado = armarOpciones(p.es, pool.map((o) => o.es), azar);
      const inversa = armarOpciones(p.en, pool.map((o) => o.en), azar);
      if (!significado && !inversa) continue;
      items.push({
        clave: `en:${p.id}`, concepto: "palabra", unidad: u.id, en: p.en, es: p.es, pron: p.pron,
        ...(p.formas ? { formas: p.formas } : {}), ...(p.ejemplo ? { ej: p.ejemplo } : {}),
        ...(significado ? { sig: [significado.opciones, significado.correcta] } : {}),
        ...(inversa ? { inv: [inversa.opciones, inversa.correcta] } : {}),
      });
    }

    // Gramática
    for (const e of u.ejercicios) {
      items.push({ clave: `gra:${e.id}`, tipo: "opcion", subtipo: "gramatica", ...base, pregunta: e.pregunta, opciones: e.opciones, correcta: e.correcta, explicacion: e.explicacion });
    }

    // Frases (compactas)
    for (const f of u.frases) {
      const compacta = { clave: `fr:${f.id}`, concepto: "frase", unidad: u.id, en: f.en, es: f.es, ...(f.trabajo ? { trabajo: true } : {}) };
      const parecidas = u.frases.filter((o) => o !== f).sort((a, b) => Math.abs(a.en.length - f.en.length) - Math.abs(b.en.length - f.en.length));
      const escuchar = armarOpciones(f.en, parecidas.slice(0, 8).map((o) => o.en), azar);
      if (escuchar) compacta.esc = [escuchar.opciones, escuchar.correcta];

      const tokens = fichasDe(f.en);
      const hueco = palabraParaHueco(tokens, vocabulario);
      if (hueco) {
        const opciones = armarOpciones(hueco.t, [...sueltas, ...parecidas.flatMap((o) => fichasDe(o.en))].filter((t) => t.length > 2), azar);
        if (opciones) {
          const conHueco = f.en.replace(new RegExp(`\\b${hueco.t.replace(/[.*+?^${}()|[\]\\']/g, "\\$&")}\\b`), "___");
          if (conHueco.includes("___")) compacta.hue = [conHueco, opciones.opciones, opciones.correcta];
        }
      }
      if (tokens.length >= 3 && tokens.length <= 12) {
        const enLaFrase = new Set(tokens.map(normal));
        const extras = barajar(
          [...new Set(u.frases.filter((o) => o !== f).flatMap((o) => fichasDe(o.en)))].filter((t) => !enLaFrase.has(normal(t))),
          azar,
        ).slice(0, 3);
        compacta.fi = barajar([...tokens, ...extras], azar);
      }
      items.push(compacta);
    }

    // Calcos: ¿cuál suena natural?
    for (const c of u.calcos ?? []) {
      const opciones = barajar([c.natural, c.calco], azar);
      items.push({
        clave: `cal:${c.id}`, tipo: "opcion", subtipo: "natural", ...base,
        pregunta: `¿Cuál suena natural en inglés?\n\n*${c.es}*`, opciones, correcta: opciones.indexOf(c.natural),
        explicacion: `✓ **${c.natural}**\n\n✗ ~~${c.calco}~~\n\n${c.explicacion}`, audioRespuesta: c.natural,
      });
    }

    // Pares mínimos (compactos)
    for (const p of u.pares ?? []) items.push({ clave: `oido:${p.id}`, concepto: "par", unidad: u.id, a: p.a, aEs: p.aEs, b: p.b, bEs: p.bEs, sonido: p.sonido, nota: p.nota });

    // Diálogos
    for (const d of u.dialogos) {
      const dialogo = { titulo: d.titulo, situacion: d.situacion, lineas: d.lineas };
      (d.preguntas ?? []).forEach((p, n) => {
        items.push({ clave: `dia:${d.id}:${n}`, tipo: "opcion", subtipo: "dialogo", ...base, pregunta: p.pregunta, dialogo, opciones: p.opciones, correcta: p.correcta, explicacion: p.explicacion });
      });
    }
  }

  const vistas = new Set();
  return { unidades: listaUnidades, items: items.filter((it) => !vistas.has(it.clave) && vistas.add(it.clave)) };
}

/** Las formas de preguntar una palabra (de reconocer a escribir). */
function variantesDePalabra(p) {
  const variantes = [];
  const respuestaAudio = p.ej?.en ?? p.en;
  if (p.sig) {
    const [opciones, correcta] = p.sig;
    variantes.push({ forma: "palabra", nivel: 0, tipo: "opcion", subtipo: "palabra", pregunta: `¿Qué significa **${p.en}**?`, audio: p.en, opciones, correcta, audioRespuesta: respuestaAudio });
    variantes.push({ forma: "oir-palabra", nivel: 1, voz: true, tipo: "opcion", subtipo: "escuchar", pregunta: "¿Qué palabra escuchaste? Elige su significado", audio: p.en, soloAudio: true, opciones, correcta, audioRespuesta: respuestaAudio });
  }
  if (p.inv) {
    const [opciones, correcta] = p.inv;
    variantes.push({ forma: "inversa", nivel: 1, tipo: "opcion", subtipo: "inversa", pregunta: `¿Cómo se dice **${p.es}** en inglés?`, opciones, correcta, audioRespuesta: p.en });
  }
  variantes.push({ forma: "escribir-palabra", nivel: 2, tipo: "escribir", subtipo: "escribir", pregunta: `Escribe en inglés: **${p.es}**`, respuesta: p.en, aceptadas: p.en.includes(" / ") ? p.en.split(" / ") : [], audioRespuesta: p.en });
  return variantes;
}

/** Las formas de preguntar una frase (de escuchar a escribirla sin ayuda). */
function variantesDeFrase(f) {
  const variantes = [];
  if (f.esc) variantes.push({ forma: "escuchar", nivel: 0, voz: true, tipo: "opcion", subtipo: "escuchar", pregunta: "¿Qué escuchaste?", audio: f.en, soloAudio: true, opciones: f.esc[0], correcta: f.esc[1] });
  if (f.hue) {
    const [conHueco, opciones, correcta] = f.hue;
    variantes.push({ forma: "hueco", nivel: 0, tipo: "opcion", subtipo: "hueco", pregunta: `Completa la frase:\n\n**${conHueco}**\n\n*${f.es}*`, audio: f.en, opciones, correcta, audioRespuesta: f.en });
  }
  if (f.fi) {
    const respuesta = fichasDe(f.en);
    variantes.push({ forma: "traducir", nivel: 1, tipo: "armar", subtipo: "traducir", pregunta: `Traduce al inglés: **${f.es}**`, respuesta, fichas: f.fi, audioRespuesta: f.en });
    variantes.push({ forma: "dictado", nivel: 2, voz: true, tipo: "armar", subtipo: "dictado", pregunta: "Arma la frase que escuchas", audio: f.en, soloAudio: true, respuesta, fichas: f.fi });
  }
  variantes.push({ forma: "hablar", nivel: 2, micro: true, tipo: "hablar", subtipo: "hablar", pregunta: "Lee en voz alta", texto: f.en, traduccion: f.es, audio: f.en });
  variantes.push({ forma: "escribir", nivel: 3, tipo: "escribir", subtipo: "escribir", pregunta: `Escribe en inglés: **${f.es}**`, respuesta: f.en, audioRespuesta: f.en });
  return variantes;
}

/** Un par mínimo: oyes una de las dos palabras. */
function variantesDePar(p) {
  const opciones = [`${p.a} (${p.aEs})`, `${p.b} (${p.bEs})`];
  const oir = (cual) => ({ forma: `oir-${cual}`, nivel: 0, voz: true, tipo: "opcion", subtipo: "oido", pregunta: "¿Qué palabra escuchaste?", audio: p[cual], soloAudio: true, opciones, correcta: cual === "a" ? 0 : 1 });
  return [oir("a"), oir("b")];
}

/**
 * El archivo guarda cada concepto compacto (para que pese poco y quepa offline); al cargarlo se
 * arman sus variantes, su explicación y su fuente. Ítems que no son conceptos pasan igual.
 * @param {{ unidades: object[], items: object[] }} datos  lo que escribe generarItemsIngles
 */
export function expandirIngles({ unidades, items }) {
  const titulos = new Map(unidades.map((u) => [u.id, u.titulo]));
  const fuenteDe = (unidad) => ({ tipo: "ingles", id: unidad, titulo: titulos.get(unidad) ?? unidad });
  return {
    unidades,
    items: items.map((it) => {
      if (!it.concepto) return it.fuente ? it : { ...it, fuente: fuenteDe(it.unidad) };
      const base = { clave: it.clave, tipo: "concepto", concepto: it.concepto, unidad: it.unidad, fuente: fuenteDe(it.unidad) };
      if (it.concepto === "palabra") {
        const formas = it.formas ? ` (pasado *${it.formas.pasado}*, participio *${it.formas.participio}*)` : "";
        const ejemplo = it.ej ? `\n\n> ${it.ej.en}\n> *${it.ej.es}*` : "";
        return { ...base, en: it.en, es: it.es, explicacion: `**${it.en}** = ${it.es}${formas}. Se pronuncia más o menos *${it.pron}*.${ejemplo}`, variantes: variantesDePalabra(it) };
      }
      if (it.concepto === "frase") return { ...base, en: it.en, es: it.es, trabajo: !!it.trabajo, explicacion: `**${it.en}**\n\n*${it.es}*`, variantes: variantesDeFrase(it) };
      if (it.concepto === "par") return { ...base, explicacion: `**${it.a}** (${it.aEs}) vs **${it.b}** (${it.bEs}): ${it.sonido ?? ""}\n\n${it.nota}`, variantes: variantesDePar(it) };
      return { ...it, ...base };
    }),
  };
}

/** Historias y roleplays de cada unidad (pantallas aparte, no ítems de lección). */
export function historiasParaLeer(unidades) {
  return {
    historias: unidades.flatMap((u) => (u.historias ?? []).map((h) => ({ ...h, unidad: u.id, unidadTitulo: u.titulo, etapa: u.etapa }))),
    roleplays: unidades.flatMap((u) => (u.roleplays ?? []).map((r) => ({ ...r, unidad: u.id, unidadTitulo: u.titulo, etapa: u.etapa }))),
  };
}

/** Lo que necesita la pantalla de cada unidad (teoría, palabras y diálogos), sin lo que ya va en los ítems. */
export function unidadesParaLeer(unidades) {
  return unidades.map((u) => ({
    id: u.id,
    titulo: u.titulo,
    etapa: u.etapa,
    nivel: u.nivel,
    descripcion: u.descripcion ?? "",
    teoria: u.teoria,
    palabras: u.palabras.map(({ id, en, es, pron, tipo, formas, ejemplo }) => ({ id, en, es, pron, tipo, formas, ejemplo })),
    dialogos: u.dialogos.map(({ id, titulo, situacion, lineas }) => ({ id, titulo, situacion, lineas })),
  }));
}
