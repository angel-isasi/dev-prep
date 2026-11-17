// Contenido de la sección Inglés (content/ingles/<etapa>/<NN-slug>/). Formato: docs/guia-ingles.md.
// Lo usan el validador (scripts/validar-ingles.js) y el exportador de la versión web.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const ETAPAS = ["basico", "intermedio", "trabajo", "avanzado", "superior", "dominio"];
export const NIVELES = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const TIPOS_PALABRA = ["sustantivo", "verbo", "adjetivo", "adverbio", "expresion", "pronombre", "preposicion", "conector", "numero"];
export const SECCIONES_TEORIA = ["En una frase", "Cómo se forma", "Errores típicos", "Pronunciación"];

const leerJson = async (ruta, porDefecto) => {
  try {
    return JSON.parse(await readFile(ruta, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return porDefecto;
    throw new Error(`${path.basename(path.dirname(ruta))}/${path.basename(ruta)}: ${error.message}`);
  }
};

/**
 * Carga todas las unidades de inglés.
 * @returns {Promise<{ unidades: object[], errores: string[] }>}
 */
export async function cargarIngles(contenidoDir) {
  const raiz = path.join(contenidoDir, "ingles");
  const unidades = [];
  const errores = [];
  for (const etapa of ETAPAS) {
    const dir = path.join(raiz, etapa);
    const carpetas = await readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const c of carpetas.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const carpeta = path.join(dir, c.name);
      try {
        const meta = await leerJson(path.join(carpeta, "meta.json"), null);
        if (!meta) {
          errores.push(`${etapa}/${c.name}: falta meta.json`);
          continue;
        }
        unidades.push({
          ...meta,
          etapa: meta.etapa ?? etapa,
          carpeta: `${etapa}/${c.name}`,
          teoria: await readFile(path.join(carpeta, "teoria.md"), "utf8").catch(() => ""),
          palabras: await leerJson(path.join(carpeta, "palabras.json"), []),
          frases: await leerJson(path.join(carpeta, "frases.json"), []),
          ejercicios: await leerJson(path.join(carpeta, "ejercicios.json"), []),
          dialogos: await leerJson(path.join(carpeta, "dialogos.json"), []),
          historias: await leerJson(path.join(carpeta, "historia.json"), []),
          roleplays: await leerJson(path.join(carpeta, "roleplay.json"), []),
          calcos: await leerJson(path.join(carpeta, "calcos.json"), []),
          pares: await leerJson(path.join(carpeta, "pares.json"), []),
        });
      } catch (error) {
        errores.push(`${etapa}/${c.name}: ${error.message}`);
      }
    }
  }
  unidades.sort((a, b) => ETAPAS.indexOf(a.etapa) - ETAPAS.indexOf(b.etapa) || (a.orden ?? 99) - (b.orden ?? 99));
  return { unidades, errores };
}

const normal = (t) => String(t ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/** Revisa una pregunta de opción múltiple. */
function revisarOpcion(p, donde, problemas) {
  if (!p.pregunta) problemas.push(`${donde}: falta la pregunta`);
  if (!Array.isArray(p.opciones) || p.opciones.length < 2 || p.opciones.length > 4) problemas.push(`${donde}: necesita de 2 a 4 opciones`);
  else {
    if (new Set(p.opciones.map(normal)).size !== p.opciones.length) problemas.push(`${donde}: opciones repetidas`);
    if (!Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= p.opciones.length) problemas.push(`${donde}: "correcta" fuera de rango`);
  }
  if (!p.explicacion) problemas.push(`${donde}: falta la explicación`);
}

/**
 * Revisa todas las unidades: forma, ids únicos, palabras sin repetir y preguntas bien hechas.
 * @returns {string[]} problemas (vacío si todo está bien)
 */
export function revisarIngles(unidades) {
  const problemas = [];
  const ids = new Map();
  const palabras = new Map();
  const usarId = (id, donde) => {
    if (!id) return problemas.push(`${donde}: falta id`);
    if (ids.has(id)) problemas.push(`${donde}: id "${id}" repetido (también en ${ids.get(id)})`);
    else ids.set(id, donde);
  };

  for (const u of unidades) {
    const d = u.carpeta ?? u.id;
    usarId(u.id, d);
    if (!u.titulo) problemas.push(`${d}: falta titulo`);
    if (!ETAPAS.includes(u.etapa)) problemas.push(`${d}: etapa inválida`);
    if (!NIVELES.includes(u.nivel)) problemas.push(`${d}: nivel inválido (${u.nivel})`);
    if (!Number.isInteger(u.orden)) problemas.push(`${d}: falta orden`);
    for (const s of SECCIONES_TEORIA) if (!u.teoria.includes(`## ${s}`)) problemas.push(`${d}: teoria.md sin la sección "${s}"`);
    if (u.palabras.length === 0) problemas.push(`${d}: sin palabras`);
    if (u.frases.length < 10) problemas.push(`${d}: tiene ${u.frases.length} frases (mínimo 10)`);

    for (const p of u.palabras) {
      const donde = `${d} palabra ${p.id ?? p.en}`;
      usarId(p.id, donde);
      if (!p.en || !p.es || !p.pron) problemas.push(`${donde}: faltan en, es o pron`);
      if (p.tipo && !TIPOS_PALABRA.includes(p.tipo)) problemas.push(`${donde}: tipo "${p.tipo}" inválido`);
      if (p.ejemplo && (!p.ejemplo.en || !p.ejemplo.es)) problemas.push(`${donde}: ejemplo incompleto`);
      const clave = normal(p.en);
      if (palabras.has(clave)) problemas.push(`${donde}: "${p.en}" ya está en ${palabras.get(clave)}`);
      else palabras.set(clave, d);
    }
    for (const f of u.frases) {
      const donde = `${d} frase ${f.id}`;
      usarId(f.id, donde);
      if (!f.en || !f.es) problemas.push(`${donde}: faltan en o es`);
      const n = String(f.en ?? "").split(/\s+/).filter(Boolean).length;
      if (n < 2 || n > 16) problemas.push(`${donde}: ${n} palabras (de 2 a 16)`);
    }
    for (const e of u.ejercicios) {
      usarId(e.id, `${d} ejercicio ${e.id}`);
      revisarOpcion(e, `${d} ejercicio ${e.id}`, problemas);
    }
    for (const dl of u.dialogos) {
      const donde = `${d} diálogo ${dl.id}`;
      usarId(dl.id, donde);
      if (!Array.isArray(dl.lineas) || dl.lineas.length < 2) problemas.push(`${donde}: necesita al menos 2 líneas`);
      for (const l of dl.lineas ?? []) if (!l.quien || !l.en || !l.es) problemas.push(`${donde}: línea incompleta`);
      (dl.preguntas ?? []).forEach((p, i) => revisarOpcion(p, `${donde} pregunta ${i + 1}`, problemas));
    }
    for (const h of u.historias ?? []) {
      const donde = `${d} historia ${h.id}`;
      usarId(h.id, donde);
      if (!h.titulo) problemas.push(`${donde}: falta titulo`);
      const pasos = Array.isArray(h.pasos) ? h.pasos : [];
      const lineas = pasos.filter((p) => !p.tipo);
      const retos = pasos.filter((p) => p.tipo);
      if (lineas.length < 6) problemas.push(`${donde}: ${lineas.length} líneas (mínimo 6)`);
      if (retos.length < 2) problemas.push(`${donde}: ${retos.length} preguntas (mínimo 2)`);
      for (const l of lineas) if (!l.quien || !l.en || !l.es) problemas.push(`${donde}: línea incompleta`);
      retos.forEach((p, i) => {
        if (p.tipo !== "pregunta" && p.tipo !== "completa") problemas.push(`${donde} paso ${i + 1}: tipo "${p.tipo}" inválido`);
        if (p.tipo === "completa") {
          if (!p.quien || !String(p.en ?? "").includes("___")) problemas.push(`${donde} paso ${i + 1}: "completa" necesita quien y una línea con ___`);
          revisarOpcion({ ...p, pregunta: p.en }, `${donde} paso ${i + 1}`, problemas);
        } else revisarOpcion(p, `${donde} paso ${i + 1}`, problemas);
      });
    }
    for (const r of u.roleplays ?? []) {
      const donde = `${d} roleplay ${r.id}`;
      usarId(r.id, donde);
      if (!r.titulo || !r.situacion) problemas.push(`${donde}: falta titulo o situacion`);
      const turnos = Array.isArray(r.turnos) ? r.turnos : [];
      const tuyos = turnos.filter((t) => t.opciones);
      if (tuyos.length < 2) problemas.push(`${donde}: ${tuyos.length} turnos tuyos (mínimo 2)`);
      for (const t of turnos) {
        if (t.opciones) {
          if (t.opciones.length < 2 || t.opciones.length > 4) problemas.push(`${donde}: un turno necesita 2 a 4 opciones`);
          if (t.opciones.filter((o) => o.correcta === true).length !== 1) problemas.push(`${donde}: un turno necesita exactamente una opción correcta`);
          if (new Set(t.opciones.map((o) => normal(o.en))).size !== t.opciones.length) problemas.push(`${donde}: opciones repetidas`);
          for (const o of t.opciones) if (!o.en || !o.explicacion || (o.correcta && !o.es)) problemas.push(`${donde}: opción incompleta (${o.en ?? "?"})`);
        } else if (!t.quien || !t.en || !t.es) problemas.push(`${donde}: línea incompleta`);
      }
    }
    for (const c of u.calcos ?? []) {
      const donde = `${d} calco ${c.id}`;
      usarId(c.id, donde);
      if (!c.es || !c.natural || !c.calco || !c.explicacion) problemas.push(`${donde}: faltan es, natural, calco o explicacion`);
      if (normal(c.natural) === normal(c.calco)) problemas.push(`${donde}: natural y calco son iguales`);
    }
    for (const p of u.pares ?? []) {
      const donde = `${d} par ${p.id}`;
      usarId(p.id, donde);
      if (!p.a || !p.b || !p.aEs || !p.bEs || !p.nota) problemas.push(`${donde}: faltan a, b, aEs, bEs o nota`);
      if (normal(p.a) === normal(p.b)) problemas.push(`${donde}: a y b son iguales`);
    }
  }
  return problemas;
}
