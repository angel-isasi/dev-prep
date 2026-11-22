// Un enunciado (Markdown) en tarjetas: lo que tienes que hacer arriba, destacado, y cada sección
// ("Reglas", "Ejemplos", "Por qué importa", "Reto extra"...) en su propia tarjeta, dos por fila en
// pantalla grande. Las que traen código largo o tablas ocupan todo el ancho para leerse sin desplazar,
// y las que tienen 3 o más subsecciones "###" (por ejemplo, pasos) muestran cada una en su tarjeta.
//
// Menos letra a la vista: lo que hace falta para actuar se ve de entrada; lo que amplía (por qué
// importa, errores comunes, otra forma, conceptos, reto extra) queda plegado con su título, y se
// abre con un toque. Nada se borra: la app sigue siendo la única fuente sin internet.
import { useMemo } from "react";
import { Markdown } from "./Markdown.jsx";
import { seccionesDe, subseccionesDe } from "../lib/teoria.js";
import estilos from "./EnunciadoOrganizado.module.css";

// Secciones que, si el enunciado no tiene texto inicial, hacen de "qué tienes que hacer"
// Secciones que amplían: se muestran cerradas, al final
const PLEGADAS = /^(por qué importa|por qué funciona|errores comunes|otra forma|cómo explicarlo|conceptos|reto extra|pistas?( de diseño)?$|lo que se valora)/i;
const palabras = (texto) => texto.trim().split(/\s+/).filter(Boolean).length;

/** Parte un texto en su primera oración (la idea) y el resto. Si no se puede partir limpio, todo es la idea. */
export function ideaPrincipal(cuerpo) {
  const texto = cuerpo.trim();
  const m = texto.match(/^([^\n]+?[.:!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])([\s\S]+)$/);
  const pares = (t) => (t.match(/`/g) ?? []).length % 2 === 0 && (t.match(/\*\*/g) ?? []).length % 2 === 0;
  if (!m || !pares(m[1])) return { idea: texto, resto: "" };
  return { idea: m[1], resto: m[2].trim() };
}

const REGLAS = /^(reglas|requisitos|condiciones|restricciones|ten en cuenta)/i;

/** Si el texto es solo una lista de Markdown, sus elementos; si no, null. */
export function listaDe(cuerpo) {
  const lineas = cuerpo.trim().split("\n");
  if (!lineas.every((l) => !l.trim() || /^[-*] /.test(l) || /^\s+\S/.test(l))) return null;
  const items = [];
  for (const l of lineas) {
    if (/^[-*] /.test(l)) items.push(l.slice(2));
    else if (l.trim() && items.length) items[items.length - 1] += " " + l.trim();
  }
  return items.length >= 2 ? items : null;
}

/** Si el texto es un solo bloque de código con líneas "llamada; // resultado", esas parejas; si no, null. */
export function casosDe(cuerpo) {
  const m = cuerpo.trim().match(/^```\w*\n([\s\S]*?)\n```$/);
  if (!m) return null;
  const lineas = m[1].split("\n").filter((l) => l.trim());
  const casos = lineas.map((l) => l.match(/^(.+?);?\s*\/\/\s*(.+)$/));
  if (casos.length === 0 || casos.some((c) => !c)) return null;
  return casos.map((c) => ({ llamada: c[1].trim(), resultado: c[2].trim() }));
}

const PRINCIPALES = /^(el problema|tu tarea|qué hacer|qué debe hacer|la función que vas a probar|enunciado|idea clave)$|^ticket/i;

/**
 * @param {{ markdown: string, etiqueta?: string, primeraDestacada?: boolean }} props
 * primeraDestacada: si no hay texto inicial, la primera sección va destacada arriba (para guías).
 */
export function EnunciadoOrganizado({ markdown, etiqueta = "Qué tienes que hacer", primeraDestacada = false, parejo = false, extra = null, junto = null }) {
  const { antes, secciones } = useMemo(() => seccionesDe(markdown), [markdown]);
  if (secciones.length === 0)
    return (
      <article className={`tarjeta ${estilos.unico}`}>
        <Markdown>{markdown}</Markdown>
      </article>
    );

  let principal = antes;
  let resto = secciones;
  let titulo = etiqueta;
  if (!principal && (primeraDestacada || PRINCIPALES.test(secciones[0].titulo))) {
    principal = secciones[0].cuerpo;
    titulo = secciones[0].titulo;
    resto = secciones.slice(1);
  }

  // En la página del ejercicio, las reglas (si son una lista) van al lado de la tarea, numeradas
  const reglas = parejo && principal ? resto.find((s) => REGLAS.test(s.titulo) && listaDe(s.cuerpo)) : null;
  // Y los ejemplos "llamada → resultado" van dentro de la ficha de la tarea, a su derecha
  const ejemplos = null;
  const visibles = resto.filter((s) => !PLEGADAS.test(s.titulo) && s !== reglas && s !== ejemplos);
  const plegadas = resto.filter((s) => PLEGADAS.test(s.titulo));
  // Las fichas angostas van de a dos; si sobra una, ocupa toda la fila en vez de dejar media fila vacía
  const angostas = visibles.filter((s) => !s.ancho && subseccionesDe(s.cuerpo).partes.length < 3);
  const suelta = angostas.length % 2 === 1 ? angostas.at(-1) : null;

  return (
    <div className={estilos.enunciado} data-parejo={parejo}>
      <div className={junto ? estilos.duo : estilos.solo}>
      {junto}
      {principal && (
        <section className={estilos.principal} data-con-reglas={!!reglas}>
          <div className={estilos.tarea}>
            <span className={estilos.etiqueta}>{titulo}</span>
            <Markdown>{principal}</Markdown>
          </div>
          {reglas && (
            <div className={estilos.reglas}>
              <span className={estilos.etiqueta}>{reglas.titulo}</span>
              <ol>
                {listaDe(reglas.cuerpo).map((r, i) => (
                  <li key={i}>
                    <b>{i + 1}</b>
                    <Markdown>{r}</Markdown>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}
      </div>
      <div className={estilos.secciones}>
        {visibles.map((s, i) => {
          const sub = subseccionesDe(s.cuerpo);
          if (sub.partes.length >= 3)
            return (
              <section key={i} className={estilos.conPasos}>
                <h2>{s.titulo}</h2>
                {sub.antes && <Markdown>{sub.antes}</Markdown>}
                <ol className={estilos.pasos}>
                  {sub.partes.map((p, j) => (
                    <li key={j}>
                      <h3>{p.titulo}</h3>
                      <Markdown>{p.cuerpo}</Markdown>
                    </li>
                  ))}
                </ol>
              </section>
            );
          const casos = parejo && /^ejemplos?/i.test(s.titulo) ? casosDe(s.cuerpo) : null;
          return (
            <section key={i} className={estilos.seccion} data-ancho={s.ancho || s === suelta || !!casos}>
              <h2>{s.titulo}</h2>
              {casos ? (
                <table className={estilos.casos}>
                  <thead>
                    <tr>
                      <th>Si llamas</th>
                      <th aria-hidden />
                      <th>Devuelve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {casos.map((c, j) => (
                      <tr key={j}>
                        <td>
                          <code>{c.llamada}</code>
                        </td>
                        <td aria-hidden>→</td>
                        <td>
                          <code>{c.resultado}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Markdown>{s.cuerpo}</Markdown>
              )}
            </section>
          );
        })}
      </div>
      {(plegadas.length > 0 || extra) && (
        <div className={extra ? estilos.abajo : undefined}>
        <div className={estilos.plegadas}>
          {parejo &&
            plegadas.length <= 2 &&
            plegadas.map((s, i) => {
              const { idea, resto: demas } = ideaPrincipal(s.cuerpo);
              return (
                <section key={i} className={estilos.porque}>
                  <span className={estilos.etiqueta}>{s.titulo}</span>
                  <div className={estilos.idea}>
                    <Markdown>{idea}</Markdown>
                  </div>
                  {demas && <Markdown>{demas}</Markdown>}
                </section>
              );
            })}
          {!(parejo && plegadas.length <= 2) && plegadas.map((s, i) => (
            <details key={i} className={estilos.plegada}>
              <summary>
                <span>{s.titulo}</span>
                <small>{Math.max(1, Math.round(palabras(s.cuerpo) / 200))} min</small>
              </summary>
              <Markdown>{s.cuerpo}</Markdown>
            </details>
          ))}
        </div>
        {extra}
        </div>
      )}
    </div>
  );
}
