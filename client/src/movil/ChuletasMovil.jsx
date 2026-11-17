// Chuletas: el resumen ("Chuleta") y lo que preguntan en la entrevista de cada tema de Aprender,
// para repasar en 2 minutos. En el celular cada tema se abre y se cierra tocándolo; en pantalla grande,
// los temas van en un índice a la izquierda y el elegido se ve a lo ancho, con las preguntas en tarjetas.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { Markdown } from "../components/Markdown.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { PreguntasEntrevista } from "../components/PreguntasEntrevista.jsx";
import { usePantallaGrande } from "../hooks/usePantallaGrande.js";
import { preguntasDe } from "../lib/teoria.js";
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
  const grande = usePantallaGrande();

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

      {grande ? (
        <ChuletaGrande temas={delArea} elegida={abierta} alElegir={setAbierta} />
      ) : (
      <div className={estilos.lista}>
        {delArea.map((c) => {
          const abiertaEsta = abierta === c.id;
          return (
            <article key={c.id} className={`aparecer ${estilos.chuleta}`} data-area={c.area} data-abierta={abiertaEsta}>
              <button
                type="button"
                className={estilos.cabeza}
                onClick={() => setAbierta(abiertaEsta ? null : c.id)}
                aria-expanded={abiertaEsta}
              >
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
      )}
    </section>
  );
}

function ChuletaGrande({ temas, elegida, alElegir }) {
  const c = temas.find((t) => t.id === elegida) ?? temas[0];
  if (!c) return null;
  const preguntas = preguntasDe(c.entrevista);
  return (
    <div className={estilos.grande}>
      <nav className={estilos.indice} aria-label="Temas">
        {temas.map((t) => (
          <button key={t.id} type="button" data-area={t.area} aria-current={t.id === c.id ? "true" : undefined} onClick={() => alElegir(t.id)}>
            <span className={estilos.numero}>{String(t.orden).padStart(2, "0")}</span>
            {t.titulo}
          </button>
        ))}
      </nav>
      <article key={c.id} className={`aparecer ${estilos.detalle}`} data-area={c.area}>
        <header className={estilos.detalleCabecera}>
          <span className={estilos.numeroGrande}>{String(c.orden).padStart(2, "0")}</span>
          <h2>{c.titulo}</h2>
          <Link to={`/aprender/${c.id}`} className="boton">
            Ver el tema completo →
          </Link>
        </header>
        <div className={estilos.hoja}>
          <Markdown>{c.chuleta}</Markdown>
        </div>
        {c.entrevista && (
          <section className={estilos.preguntasGrande}>
            <h3>En la entrevista</h3>
            {preguntas ? <PreguntasEntrevista preguntas={preguntas} columnas={360} /> : <Markdown>{c.entrevista}</Markdown>}
          </section>
        )}
      </article>
    </div>
  );
}
