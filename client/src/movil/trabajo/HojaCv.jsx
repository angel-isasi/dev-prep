// La hoja del CV con formato formal (como un CV hecho en Word): Arial, nombre grande, secciones en
// mayúsculas con una línea debajo, puestos en negrita, texto justificado y habilidades en tabla.
// La usan Mi CV (tu CV base) y la página del CV de cada oferta.
//
// "Descargar PDF" no imprime la página de la app: copia la hoja a un documento aparte (un iframe
// invisible) que solo tiene la hoja y estos estilos, y lo imprime. Así nada de la app (menú, modo
// oscuro, anchos de las pantallas) puede cambiar cómo sale el PDF.

/** Estilos de la hoja: los mismos en pantalla y en el PDF. */
export const CSS_HOJA = `
.cv-hoja { box-sizing: border-box; width: 100%; max-width: 210mm; padding: 12mm 15mm; background: #fff; color: #000;
  font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; line-height: 1.27; text-align: left; }
.cv-hoja * { box-sizing: border-box; font-family: inherit; color: inherit; letter-spacing: normal; }
.cv-hoja h1 { margin: 0; font-size: 20pt; font-weight: 700; line-height: 1.15; }
.cv-hoja .cv-titular { margin: 2px 0 2px; color: #555; font-size: 12pt; }
.cv-hoja .cv-contacto { margin: 0; color: #555; font-size: 8.5pt; }
.cv-hoja h2 { margin: 9px 0 4px; padding-bottom: 1px; border-bottom: 1px solid #000; font-size: 11.5pt; font-weight: 700; text-transform: uppercase; break-after: avoid; }
.cv-hoja p { margin: 0 0 3px; }
.cv-hoja .cv-texto { text-align: justify; }
.cv-hoja .cv-puesto { margin: 6px 0 0; font-weight: 700; break-after: avoid; }
.cv-hoja h2 + .cv-puesto { margin-top: 0; }
.cv-hoja .cv-lugar { margin: 0 0 2px; color: #555; font-style: italic; }
.cv-hoja ul { margin: 0 0 3px; padding-left: 16px; }
.cv-hoja li { margin: 0 0 1px; text-align: justify; break-inside: avoid; }
.cv-hoja table { border-collapse: collapse; }
.cv-hoja td { padding: 0 0 2px; vertical-align: top; }
.cv-hoja td:first-child { width: 36mm; padding-right: 10px; font-weight: 700; white-space: nowrap; }
`;

// En el PDF: hoja A4 sin márgenes del navegador (así no salen la fecha ni la dirección); el margen lo
// pone la hoja, y se repite si el CV pasa a una segunda página.
export const CSS_PDF = `
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; }
.cv-hoja { max-width: none; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
`;

/** Las secciones donde cada línea "Clave: valor" va en una tabla de dos columnas. */
const ES_TABLA = /habilidad|competencia|skill|idioma|conocimiento/i;
const FILA = /^\**([^:*]{2,32}?)\**:\**\s+(.+)$/;

/**
 * El texto del CV base (después del encabezado) convertido en secciones para la hoja:
 * "# Sección", "## Puesto | Lugar | Fechas" (en negrita), la línea que sigue a un puesto (en cursiva),
 * "- punto" (viñetas) y, en Habilidades e Idiomas, "Grupo: cosas" en tabla.
 * @returns {{ titulo: string, bloques: object[] }[]}
 */
export function seccionesDeTexto(cuerpo = "") {
  const secciones = [];
  let seccion = null;
  let anterior = null;
  const agregar = (bloque) => {
    if (!seccion) secciones.push((seccion = { titulo: "", bloques: [] }));
    const ultimo = seccion.bloques.at(-1);
    if (bloque.tipo === "lista" && ultimo?.tipo === "lista" && anterior === "lista") ultimo.items.push(...bloque.items);
    else if (bloque.tipo === "tabla" && ultimo?.tipo === "tabla") ultimo.filas.push(...bloque.filas);
    else seccion.bloques.push(bloque);
    anterior = bloque.tipo;
  };
  for (const cruda of String(cuerpo).split("\n")) {
    const linea = cruda.trim();
    if (!linea) {
      if (anterior !== "lista") anterior = null;
      continue;
    }
    if (/^# /.test(linea)) {
      secciones.push((seccion = { titulo: linea.slice(2).trim(), bloques: [] }));
      anterior = null;
      continue;
    }
    if (/^#{2,3} /.test(linea)) {
      agregar({ tipo: "puesto", texto: linea.replace(/^#+ /, "") });
      continue;
    }
    const vineta = linea.match(/^[-*•]\s+(.+)$/);
    const texto = vineta ? vineta[1] : linea;
    const fila = ES_TABLA.test(seccion?.titulo ?? "") && texto.match(FILA);
    if (fila) agregar({ tipo: "tabla", filas: [[fila[1].trim(), fila[2].trim()]] });
    else if (vineta) agregar({ tipo: "lista", items: [texto] });
    else if (anterior === "puesto") agregar({ tipo: "lugar", texto });
    else agregar({ tipo: "texto", texto });
  }
  return secciones;
}

/** El CV que hizo la IA para una oferta, en las mismas secciones que la hoja. */
export function seccionesDeCv(cv) {
  const s = [];
  if (cv.perfil) s.push({ titulo: "Perfil", bloques: [{ tipo: "texto", texto: cv.perfil }] });
  const conPuestos = (titulo, lista, cabeza, detalle) =>
    lista?.length &&
    s.push({
      titulo,
      bloques: lista.flatMap((x) => [
        { tipo: "puesto", texto: [cabeza(x), x.periodo].filter(Boolean).join(" | ") },
        ...(detalle(x) ? [{ tipo: "lugar", texto: detalle(x) }] : []),
        ...(x.puntos?.length ? [{ tipo: "lista", items: x.puntos }] : []),
      ]),
    });
  conPuestos("Experiencia", cv.experiencia, (x) => x.puesto, (x) => x.lugar);
  if (cv.proyectos?.length)
    s.push({ titulo: "Proyectos", bloques: [{ tipo: "lista", items: cv.proyectos.map((p) => `${p.titulo}${p.enlace ? ` (${p.enlace})` : ""}: ${p.texto}`) }] });
  conPuestos("Educación", cv.educacion, (x) => x.titulo, (x) => x.detalle);
  const filas = (cv.habilidades ?? []).map((h) => [h.grupo, h.items]);
  if (cv.idiomas) filas.push(["Idiomas", cv.idiomas]);
  if (filas.length) s.push({ titulo: "Habilidades", bloques: [{ tipo: "tabla", filas }] });
  if (cv.cursos?.length) s.push({ titulo: "Cursos y certificados", bloques: [{ tipo: "lista", items: cv.cursos }] });
  return s;
}

/** "**así**" en negrita; lo demás, texto tal cual. */
function Linea({ texto }) {
  return String(texto)
    .split(/(\*\*[^*]+\*\*)/)
    .map((parte, i) => (/^\*\*[^*]+\*\*$/.test(parte) ? <strong key={i}>{parte.slice(2, -2)}</strong> : parte.replace(/\*\*/g, "")));
}

function Bloque({ b }) {
  if (b.tipo === "puesto") return <p className="cv-puesto"><Linea texto={b.texto} /></p>;
  if (b.tipo === "lugar") return <p className="cv-lugar"><Linea texto={b.texto} /></p>;
  if (b.tipo === "lista")
    return (
      <ul>
        {b.items.map((x, i) => (
          <li key={i}><Linea texto={x} /></li>
        ))}
      </ul>
    );
  if (b.tipo === "tabla")
    return (
      <table>
        <tbody>
          {b.filas.map(([k, v], i) => (
            <tr key={i}>
              <td>{k}</td>
              <td><Linea texto={v} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  return <p className="cv-texto"><Linea texto={b.texto} /></p>;
}

/**
 * La hoja del CV.
 * @param {{ cabeza: { nombre: string, titular?: string, contacto?: string[] }, secciones: object[], hojaRef?: object, className?: string }} props
 */
export function HojaCv({ cabeza, secciones, hojaRef, className = "" }) {
  return (
    <>
      <style>{CSS_HOJA}</style>
      <article ref={hojaRef} className={`cv-hoja ${className}`}>
        <h1>{cabeza.nombre || "Tu nombre"}</h1>
        {cabeza.titular && <p className="cv-titular">{cabeza.titular}</p>}
        {(cabeza.contacto ?? []).map((l) => (
          <p key={l} className="cv-contacto">{l}</p>
        ))}
        {secciones.map((s, i) => (
          <section key={i}>
            {s.titulo && <h2>{s.titulo}</h2>}
            {s.bloques.map((b, j) => (
              <Bloque key={j} b={b} />
            ))}
          </section>
        ))}
      </article>
    </>
  );
}

/**
 * Guarda la hoja en PDF: la copia a un documento aparte con solo sus estilos y abre la ventana de
 * imprimir de ese documento. El nombre (por ejemplo "CV_Angel_Isasi_Oyolo") es el del archivo PDF.
 */
export function descargarPdf(hoja, nombre = "CV") {
  if (!hoja) return;
  const marco = document.createElement("iframe");
  marco.setAttribute("aria-hidden", "true");
  marco.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(marco);
  const doc = marco.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title></title><style>${CSS_HOJA}${CSS_PDF}</style></head><body>${hoja.outerHTML}</body></html>`);
  doc.close();
  doc.title = nombre;
  const imprimir = () => {
    marco.contentWindow.focus();
    marco.contentWindow.print();
    setTimeout(() => marco.remove(), 1000);
  };
  // Espera a que el documento tenga sus letras listas antes de imprimir
  (doc.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(imprimir, 50));
}

/** "Angel Fernando Isasi Oyolo" → "CV_Angel_Isasi_Oyolo" (nombre, primer apellido y segundo). */
export function nombreArchivo(nombre = "", extra = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const corto = partes.length >= 4 ? [partes[0], ...partes.slice(-2)] : partes;
  const limpio = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");
  return ["CV", ...corto.map(limpio), extra && limpio(extra)].filter(Boolean).join("_");
}
