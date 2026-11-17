// Un enunciado (Markdown) en tarjetas: lo que tienes que hacer arriba, destacado, y cada sección
// ("Reglas", "Ejemplos", "Por qué importa", "Reto extra"...) en su propia tarjeta, dos por fila en
// pantalla grande. Las que traen código largo o tablas ocupan todo el ancho para leerse sin desplazar,
// y las que tienen 3 o más subsecciones "###" (por ejemplo, pasos) muestran cada una en su tarjeta.
import { useMemo } from "react";
import { Markdown } from "./Markdown.jsx";
import { seccionesDe, subseccionesDe } from "../lib/teoria.js";
import estilos from "./EnunciadoOrganizado.module.css";

// Secciones que, si el enunciado no tiene texto inicial, hacen de "qué tienes que hacer"
const PRINCIPALES = /^(el problema|tu tarea|qué hacer|qué debe hacer|la función que vas a probar|enunciado|idea clave)$|^ticket/i;

/**
 * @param {{ markdown: string, etiqueta?: string, primeraDestacada?: boolean }} props
 * primeraDestacada: si no hay texto inicial, la primera sección va destacada arriba (para guías).
 */
export function EnunciadoOrganizado({ markdown, etiqueta = "Qué tienes que hacer", primeraDestacada = false }) {
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

  return (
    <div className={estilos.enunciado}>
      {principal && (
        <section className={estilos.principal}>
          <span className={estilos.etiqueta}>{titulo}</span>
          <Markdown>{principal}</Markdown>
        </section>
      )}
      <div className={estilos.secciones}>
        {resto.map((s, i) => {
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
          return (
            <section key={i} className={estilos.seccion} data-ancho={s.ancho}>
              <h2>{s.titulo}</h2>
              <Markdown>{s.cuerpo}</Markdown>
            </section>
          );
        })}
      </div>
    </div>
  );
}
