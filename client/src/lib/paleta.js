// Buscador global (Ctrl+K): el índice y la búsqueda. Son funciones puras para poder probarlas;
// el componente que las dibuja es components/Paleta.jsx.

const EVENTO = "devprep:paleta";

/** Abre el buscador desde cualquier botón de la app. */
export const abrirPaleta = () => window.dispatchEvent(new Event(EVENTO));

/** @param {() => void} oyente @returns {() => void} para dejar de escuchar */
export function alAbrirPaleta(oyente) {
  window.addEventListener(EVENTO, oyente);
  return () => window.removeEventListener(EVENTO, oyente);
}

/** Minúsculas y sin tildes, para que "funcion" encuentre "Función". */
export const normalizar = (texto) =>
  String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export const GRUPOS = ["Ir a", "Temas", "Ejercicios", "Referencia", "Glosario", "Entrevistas"];

/**
 * Arma el índice con todo lo que se puede buscar. Cada entrada:
 * { grupo, titulo, detalle, a (ruta a la que lleva) o accion (id), claves (texto extra para buscar) }
 */
export function armarIndice({ secciones = [], acciones = [], temas = [], ejercicios = [], referencia = [], glosario = [], preguntas = [] }) {
  const entradas = [];
  const agregar = (grupo, titulo, detalle, destino, claves = "") =>
    entradas.push({ grupo, titulo, detalle, ...destino, _titulo: normalizar(titulo), _claves: normalizar(`${detalle} ${claves}`) });

  for (const s of secciones) {
    agregar("Ir a", s.texto, "Sección", { a: s.a });
    for (const d of s.sub) if (d.a !== s.a) agregar("Ir a", d.texto, s.texto, { a: d.a });
  }
  for (const x of acciones) agregar("Ir a", x.titulo, x.detalle ?? "Acción", x.a ? { a: x.a } : { accion: x.accion }, x.claves);
  for (const t of temas) agregar("Temas", t.titulo, t.descripcion ?? "", { a: `/aprender/${t.id}` }, t.area);
  for (const e of ejercicios) agregar("Ejercicios", e.titulo, [e.coleccion?.replace("/", " · "), e.tema].filter(Boolean).join(" · "), { a: `/practicar/${e.id}` }, (e.tags ?? []).join(" "));
  for (const r of referencia) agregar("Referencia", r.nombre, r.descripcion ?? "", { a: `/referencia?q=${encodeURIComponent(r.nombre)}` }, `${r.categoria ?? ""} ${(r.tags ?? []).join(" ")}`);
  for (const g of glosario) agregar("Glosario", g.termino, g.definicion ?? "", { a: `/glosario?q=${encodeURIComponent(g.termino)}` }, g.en);
  for (const p of preguntas) agregar("Entrevistas", p.pregunta, p.categoria ?? "", { a: `/entrevistas?pregunta=${encodeURIComponent(p.id)}` });
  return entradas;
}

// Qué tan bien coincide una entrada con las palabras buscadas (0 = no coincide).
function puntaje(entrada, palabras) {
  let total = 0;
  for (const palabra of palabras) {
    const enTitulo = entrada._titulo.indexOf(palabra);
    if (enTitulo === 0) total += 10; // el título empieza con la palabra
    else if (enTitulo > 0 && /[\s.(/·-]/.test(entrada._titulo[enTitulo - 1])) total += 7; // empieza una palabra del título
    else if (enTitulo > 0) total += 4;
    else if (entrada._claves.includes(palabra)) total += 1;
    else return 0; // todas las palabras deben aparecer
  }
  // Entre coincidencias iguales, primero los títulos cortos (suelen ser lo que se busca)
  return total + Math.max(0, 2 - entrada._titulo.length / 40);
}

/**
 * Busca en el índice. Devuelve los grupos con resultados, en el orden de GRUPOS, con un tope
 * por grupo. Sin texto, devuelve solo "Ir a" (las secciones y acciones).
 * @returns {{ grupo: string, entradas: object[] }[]}
 */
export function buscar(indice, texto, { porGrupo = 6 } = {}) {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  if (!palabras.length) {
    return [{ grupo: "Ir a", entradas: indice.filter((e) => e.grupo === "Ir a") }].filter((g) => g.entradas.length);
  }
  const porNombre = new Map();
  for (const entrada of indice) {
    const p = puntaje(entrada, palabras);
    if (!p) continue;
    if (!porNombre.has(entrada.grupo)) porNombre.set(entrada.grupo, []);
    porNombre.get(entrada.grupo).push({ entrada, p });
  }
  return GRUPOS.filter((g) => porNombre.has(g)).map((grupo) => ({
    grupo,
    entradas: porNombre
      .get(grupo)
      .sort((a, b) => b.p - a.p)
      .slice(0, porGrupo)
      .map((x) => x.entrada),
  }));
}
