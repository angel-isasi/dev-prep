// Chuletas: el resumen ("Chuleta") y lo que preguntan en la entrevista de cada tema de Aprender,
// para repasar en 2 minutos. Cada tema se abre y se cierra tocándolo.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { Markdown } from "../components/Markdown.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import estilos from "./ChuletasMovil.module.css";

const AREAS = [
  { id: "javascript", texto: "JavaScript" },
  { id: "react", texto: "React" },
  { id: "typescript", texto: "TypeScript" },
  { id: "node", texto: "Node y SQL" },
];

export function ChuletasMovil() {
  const [chuletas, setChuletas] = useState(api.chuletas.guardado);
  const [area, setArea] = useState("javascript");
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    api.chuletas().then(setChuletas, () => {});
  }, []);

  if (!chuletas) return <Esqueleto variante="lista" />;
  const delArea = chuletas.filter((c) => c.area === area && c.chuleta);

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Repaso rápido" titulo="Chuletas">
        Lo esencial de cada tema en una pantalla. Ideal para repasar antes de una clase o una entrevista.
      </CabeceraPagina>

      <div className={estilos.areas} role="tablist">
        {AREAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            data-area={a.id}
            aria-selected={area === a.id}
            className={estilos.area}
            onClick={() => {
              setArea(a.id);
              setAbierta(null);
            }}
          >
            <span className={estilos.punto} aria-hidden />
            {a.texto}
          </button>
        ))}
      </div>

      <div className={estilos.lista}>
        {delArea.map((c) => {
          const abiertaEsta = abierta === c.id;
          return (
            <article key={c.id} className={estilos.chuleta} data-area={c.area} data-abierta={abiertaEsta}>
              <button type="button" className={estilos.cabeza} onClick={() => setAbierta(abiertaEsta ? null : c.id)} aria-expanded={abiertaEsta}>
                <span className={estilos.numero}>{String(c.orden).padStart(2, "0")}</span>
                <strong>{c.titulo}</strong>
                <i aria-hidden>{abiertaEsta ? "−" : "+"}</i>
              </button>
              {abiertaEsta && (
                <div className={estilos.cuerpo}>
                  <Markdown>{c.chuleta}</Markdown>
                  {c.entrevista && (
                    <div className={estilos.entrevista}>
                      <span>En la entrevista</span>
                      <Markdown>{c.entrevista}</Markdown>
                    </div>
                  )}
                  <Link to={`/aprender/${c.id}`} className={estilos.enlace}>
                    Ver el tema completo →
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
