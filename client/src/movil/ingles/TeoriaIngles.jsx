// Teoría de una unidad de inglés organizada: la idea arriba; cómo se forma y la pronunciación lado a lado;
// los errores típicos como tarjetas (lo que está mal → lo correcto). Si la teoría no trae esas secciones,
// se muestra el texto completo como antes.
import { useMemo } from "react";
import { Markdown } from "../../components/Markdown.jsx";
import { seccionesDe } from "../../lib/teoria.js";
import estilos from "./TeoriaIngles.module.css";

export function TeoriaIngles({ markdown }) {
  const partes = useMemo(() => {
    const { secciones } = seccionesDe(markdown);
    const de = (t) => secciones.find((s) => s.titulo.toLowerCase() === t)?.cuerpo;
    const frase = de("en una frase");
    const forma = de("cómo se forma");
    if (!frase || !forma) return null;
    const conocidas = ["en una frase", "cómo se forma", "errores típicos", "pronunciación"];
    const errores = de("errores típicos") ?? "";
    // Cada error es una línea "- ..." (sin sublistas): si no, se muestra como texto
    const items = errores.split("\n").filter((l) => l.trim());
    const enTarjetas = items.length > 0 && items.every((l) => l.startsWith("- "));
    return {
      frase,
      forma,
      pronunciacion: de("pronunciación"),
      errores: enTarjetas ? items.map((l) => l.slice(2)) : [],
      erroresTexto: enTarjetas ? "" : errores,
      otras: secciones.filter((s) => !conocidas.includes(s.titulo.toLowerCase())),
    };
  }, [markdown]);

  if (!partes)
    return (
      <div className={estilos.simple}>
        <Markdown>{markdown}</Markdown>
      </div>
    );

  return (
    <div className={estilos.teoria}>
      <section className={estilos.frase}>
        <span className={estilos.etiqueta}>En una frase</span>
        <Markdown>{partes.frase}</Markdown>
      </section>

      <div className={estilos.fila} data-solo={!partes.pronunciacion}>
        <section className={estilos.tarjeta}>
          <h2>Cómo se forma</h2>
          <Markdown>{partes.forma}</Markdown>
        </section>
        {partes.pronunciacion && (
          <section className={estilos.tarjeta} data-tipo="pronunciacion">
            <h2>Pronunciación</h2>
            <Markdown>{partes.pronunciacion}</Markdown>
          </section>
        )}
      </div>

      {(partes.errores.length > 0 || partes.erroresTexto) && (
        <section>
          <h2 className={estilos.subtitulo}>Errores típicos</h2>
          {partes.errores.length ? (
            <ul className={estilos.errores}>
              {partes.errores.map((e, i) => (
                <li key={i}>
                  <Markdown>{e}</Markdown>
                </li>
              ))}
            </ul>
          ) : (
            <Markdown>{partes.erroresTexto}</Markdown>
          )}
        </section>
      )}

      {partes.otras.map((s, i) => (
        <section key={i} className={estilos.tarjeta}>
          <h2>{s.titulo}</h2>
          <Markdown>{s.cuerpo}</Markdown>
        </section>
      ))}
    </div>
  );
}
