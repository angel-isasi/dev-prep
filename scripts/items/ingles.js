// Ítems de lección de la sección Inglés, generados del contenido de content/ingles (docs/guia-ingles.md).
// Van en su propio archivo (items-ingles.json) para no cargar las lecciones de programación con ellos.
//
// Tipos que salen de cada unidad:
// - opcion/palabra     "¿Qué significa work?" (con audio)          clave en:<id>
// - opcion/inversa     "¿Cómo se dice trabajar?"                    clave enr:<id>
// - emparejar          4 palabras inglés ↔ español                  clave par:en:<unidad>:<n>
// - opcion/gramatica   los ejercicios de la unidad                  clave gra:<id>
// - opcion/escuchar    oyes una frase y eliges cuál fue             clave esc:<id>
// - armar/traducir     armas en inglés una frase en español         clave arm:<id>
// - armar/dictado      oyes una frase y la armas                    clave dic:<id>
// - opcion/dialogo     comprensión de un diálogo                    clave dia:<id>:<n>

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
  }));

  for (const u of unidades) {
    const fuente = { tipo: "ingles", id: u.id, titulo: u.titulo };
    const base = { unidad: u.id, fuente };
    const azar = azarDe(u.id);
    const otrasPalabras = u.palabras;

    // Palabras: significado, "¿cómo se dice?" y emparejar
    for (const p of u.palabras) {
      const mismoTipo = otrasPalabras.filter((o) => o !== p && o.tipo === p.tipo);
      const pool = mismoTipo.length >= 3 ? mismoTipo : otrasPalabras.filter((o) => o !== p);
      const formas = p.formas ? ` (pasado *${p.formas.pasado}*, participio *${p.formas.participio}*)` : "";
      const ejemplo = p.ejemplo ? `\n\n> ${p.ejemplo.en}\n> *${p.ejemplo.es}*` : "";
      const explicacion = `**${p.en}** = ${p.es}${formas}. Se pronuncia más o menos *${p.pron}*.${ejemplo}`;

      const significado = armarOpciones(p.es, pool.map((o) => o.es), azar);
      if (significado) {
        items.push({ clave: `en:${p.id}`, tipo: "opcion", subtipo: "palabra", ...base, pregunta: `¿Qué significa **${p.en}**?`, audio: p.en, ...significado, explicacion, audioRespuesta: p.ejemplo?.en ?? p.en });
      }
      const inversa = armarOpciones(p.en, pool.map((o) => o.en), azar);
      if (inversa) {
        items.push({ clave: `enr:${p.id}`, tipo: "opcion", subtipo: "inversa", ...base, pregunta: `¿Cómo se dice **${p.es}** en inglés?`, ...inversa, explicacion, audioRespuesta: p.en });
      }
    }
    const paraEmparejar = barajar(u.palabras.filter((p) => p.es.length <= 40), azar);
    for (let g = 0; g + 4 <= paraEmparejar.length && g / 4 < 4; g += 4) {
      const grupo = paraEmparejar.slice(g, g + 4);
      if (new Set(grupo.map((p) => normal(p.es))).size < 4) continue;
      items.push({
        clave: `par:en:${u.id}:${g / 4}`,
        tipo: "emparejar",
        ...base,
        pares: grupo.map((p) => ({ izq: p.en, der: p.es })),
        explicacion: grupo.map((p) => `- **${p.en}** (*${p.pron}*): ${p.es}`).join("\n"),
      });
    }

    // Gramática
    for (const e of u.ejercicios) {
      items.push({ clave: `gra:${e.id}`, tipo: "opcion", subtipo: "gramatica", ...base, pregunta: e.pregunta, opciones: e.opciones, correcta: e.correcta, explicacion: e.explicacion });
    }

    // Frases: escuchar, traducir (armar) y dictado
    for (const f of u.frases) {
      const explicacion = `**${f.en}**\n\n*${f.es}*`;
      const parecidas = u.frases.filter((o) => o !== f).sort((a, b) => Math.abs(a.en.length - f.en.length) - Math.abs(b.en.length - f.en.length));
      const escuchar = armarOpciones(f.en, parecidas.slice(0, 8).map((o) => o.en), azar);
      if (escuchar) items.push({ clave: `esc:${f.id}`, tipo: "opcion", subtipo: "escuchar", ...base, pregunta: "¿Qué escuchaste?", audio: f.en, soloAudio: true, ...escuchar, explicacion });

      const respuesta = fichasDe(f.en);
      if (respuesta.length < 3 || respuesta.length > 12) continue;
      const enLaFrase = new Set(respuesta.map(normal));
      const extras = barajar(
        [...new Set(u.frases.filter((o) => o !== f).flatMap((o) => fichasDe(o.en)))].filter((t) => !enLaFrase.has(normal(t))),
        azar,
      ).slice(0, 3);
      const fichas = barajar([...respuesta, ...extras], azar);
      items.push({ clave: `arm:${f.id}`, tipo: "armar", subtipo: "traducir", ...base, pregunta: `Traduce al inglés: **${f.es}**`, respuesta, fichas, explicacion, audioRespuesta: f.en });
      items.push({ clave: `dic:${f.id}`, tipo: "armar", subtipo: "dictado", ...base, pregunta: "Arma la frase que escuchas", audio: f.en, soloAudio: true, respuesta, fichas, explicacion });
    }

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
