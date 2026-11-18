// Glosario para entrevistas: cada término con una definición de una frase lista para decir,
// cómo se pronuncia en inglés y qué suma puntos en la entrevista. Se busca por nombre o definición.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "../../lib/api.js";
import { hablar, hayVoz } from "../../lib/voz.js";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import estilos from "./Practica.module.css";
import { IconoAudio } from "../../components/Iconos.jsx";

const normal = (t) =>
  String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function Glosario() {
  const [categorias, setCategorias] = useState(null);
  // ?q=closure (desde el buscador global): llega ya filtrado
  const [params] = useSearchParams();
  const [busqueda, setBusqueda] = useState(() => params.get("q") ?? "");
  const [abierto, setAbierto] = useState(null);
  const voz = hayVoz();

  useEffect(() => {
    api.glosario().then(setCategorias, () => setCategorias([]));
  }, []);

  const filtradas = useMemo(() => {
    if (!categorias) return [];
    const q = normal(busqueda.trim());
    if (!q) return categorias;
    return categorias
      .map((c) => ({ ...c, terminos: c.terminos.filter((t) => normal(`${t.termino} ${t.en} ${t.definicion}`).includes(q)) }))
      .filter((c) => c.terminos.length);
  }, [categorias, busqueda]);

  if (!categorias) return <Esqueleto variante="lista" />;
  const total = categorias.reduce((n, c) => n + c.terminos.length, 0);

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta={`${total} términos`} titulo="Glosario para entrevistas">
        Una frase lista para decir por cada término, su pronunciación en inglés y lo que suma puntos. Los términos también salen en tus lecciones.
      </CabeceraPagina>
      <input className={estilos.buscador} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar: closure, CORS, hook..." aria-label="Buscar en el glosario" />
      {filtradas.map((c) => (
        <div key={c.categoria} className={estilos.grupo}>
          <h2>{c.categoria}</h2>
          <div className={estilos.terminos}>
            {c.terminos.map((t) => (
              <article key={t.id} className={estilos.termino} data-abierto={abierto === t.id}>
                <button type="button" className={estilos.terminoCabecera} onClick={() => setAbierto(abierto === t.id ? null : t.id)} aria-expanded={abierto === t.id}>
                  <strong>{t.termino}</strong>
                  {t.pron && <span className={estilos.pron}>{t.pron}</span>}
                </button>
                <p>{t.definicion}</p>
                {abierto === t.id && (
                  <div className={estilos.terminoDetalle}>
                    {t.ejemplo && <code>{t.ejemplo}</code>}
                    {t.entrevista && (
                      <p>
                        <strong>En la entrevista:</strong> {t.entrevista}
                      </p>
                    )}
                    {voz && t.en && (
                      <button type="button" className="boton" onClick={() => hablar(t.en)}>
                        <IconoAudio tamano={16} /> Cómo se dice: {t.en}
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      ))}
      {filtradas.length === 0 && <p className={estilos.ayuda}>No hay términos con "{busqueda}".</p>}
    </section>
  );
}
