// Glosario para entrevistas: cada término con una definición de una frase lista para decir,
// cómo se pronuncia en inglés y qué suma puntos en la entrevista. Se busca por nombre o definición.
// Se ve solo el término y su pronunciación; la definición aparece al tocarlo (<details>).
// Con una búsqueda escrita, los resultados salen ya abiertos.
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
  const [categoria, setCategoria] = useState(""); // "" = todas
  const voz = hayVoz();

  useEffect(() => {
    api.glosario().then(setCategorias, () => setCategorias([]));
  }, []);

  const filtradas = useMemo(() => {
    if (!categorias) return [];
    const q = normal(busqueda.trim());
    const elegidas = categoria ? categorias.filter((c) => c.categoria === categoria) : categorias;
    if (!q) return elegidas;
    return elegidas
      .map((c) => ({ ...c, terminos: c.terminos.filter((t) => normal(`${t.termino} ${t.en} ${t.definicion}`).includes(q)) }))
      .filter((c) => c.terminos.length);
  }, [categorias, busqueda, categoria]);

  if (!categorias) return <Esqueleto variante="lista" />;
  const total = categorias.reduce((n, c) => n + c.terminos.length, 0);
  const buscando = busqueda.trim() !== "";

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta={`${total} términos`} titulo="Glosario para entrevistas">
        Una frase lista para decir por cada término, su pronunciación en inglés y lo que suma puntos. Los términos también salen en tus lecciones.
      </CabeceraPagina>
      <input className={estilos.buscador} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar: closure, CORS, hook..." aria-label="Buscar en el glosario" />
      {/* Chips para quedarse con una categoría (como en Referencia) */}
      <div className={estilos.glosarioCategorias}>
        <button type="button" data-activa={!categoria} aria-pressed={!categoria} onClick={() => setCategoria("")}>
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.categoria}
            type="button"
            data-activa={categoria === c.categoria}
            aria-pressed={categoria === c.categoria}
            onClick={() => setCategoria(categoria === c.categoria ? "" : c.categoria)}
          >
            {c.categoria} <span>{c.terminos.length}</span>
          </button>
        ))}
      </div>
      {filtradas.map((c) => (
        <div key={c.categoria} className={estilos.grupo}>
          <h2>{c.categoria}</h2>
          <div className={estilos.glosarioRejilla}>
            {c.terminos.map((t) => (
              // open solo se fuerza mientras hay búsqueda; sin búsqueda cada uno se abre al tocarlo
              <details key={t.id} className={estilos.glosarioTermino} open={buscando || undefined}>
                <summary>
                  <strong>{t.termino}</strong>
                  {t.pron && <span className={estilos.pron}>{t.pron}</span>}
                </summary>
                <div className={estilos.terminoDetalle}>
                  <p>{t.definicion}</p>
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
              </details>
            ))}
          </div>
        </div>
      ))}
      {filtradas.length === 0 && (
        <p className={estilos.ayuda}>
          No hay términos con "{busqueda}"{categoria ? ` en ${categoria}` : ""}.
        </p>
      )}
    </section>
  );
}
