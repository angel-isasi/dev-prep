// Una unidad de inglés para leer: teoría corta, las palabras con su pronunciación y audio, y los diálogos.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../../lib/api.js";
import { hablar, hablarVarias, hayVoz } from "../../lib/voz.js";
import { Markdown } from "../../components/Markdown.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import estilos from "./Ingles.module.css";

export function InglesUnidad() {
  const { id } = useParams();
  const [unidad, setUnidad] = useState(null);
  const [error, setError] = useState(null);
  const [traducir, setTraducir] = useState(false);
  const [mias, setMias] = useState({});
  useEffect(() => {
    api.misPalabras().then(setMias);
  }, []);
  const voz = hayVoz();

  useEffect(() => {
    setUnidad(null);
    api.inglesUnidad(id).then(setUnidad, (e) => setError(e.message));
  }, [id]);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!unidad) return <Esqueleto variante="texto" />;

  return (
    <article className={estilos.pagina} data-area="ingles">
      <Link to="/ingles" className={estilos.volver}>
        ← Inglés
      </Link>
      <p className={estilos.etiqueta}>
        Nivel {unidad.nivel} · {unidad.palabras.length} palabras
      </p>
      <h1 className={estilos.titulo}>{unidad.titulo}</h1>
      {unidad.descripcion && <p className={estilos.ayuda}>{unidad.descripcion}</p>}

      <div className={estilos.acciones}>
        <Link to={`/leccion?ambito=ingles&unidad=${encodeURIComponent(unidad.id)}`} className="boton boton-primario" onClick={() => api.elegirUnidadIngles(unidad.id)}>
          Practicar esta unidad
        </Link>
      </div>

      <div className={estilos.teoria}>
        <Markdown>{unidad.teoria}</Markdown>
      </div>

      <section className={estilos.bloque}>
        <h2>Palabras</h2>
        <ul className={estilos.palabras}>
          {unidad.palabras.map((p) => (
            <li key={p.id}>
              {voz && (
                <button type="button" className={estilos.audio} onClick={() => hablar(p.ejemplo?.en ? `${p.en}. ${p.ejemplo.en}` : p.en)} aria-label={`Escuchar ${p.en}`}>
                  🔊
                </button>
              )}
              <button
                type="button"
                className={estilos.audio}
                aria-label={mias[p.id] ? "Quitar de mis palabras" : "Agregar a mis palabras"}
                onClick={async () => {
                  await api.alternarMiPalabra(p.id);
                  setMias(await api.misPalabras());
                }}
              >
                {mias[p.id] ? "★" : "☆"}
              </button>
              <div>
                <strong>{p.en}</strong> <span className={estilos.pron}>{p.pron}</span>
                {p.formas && (
                  <span className={estilos.pron}>
                    {" "}
                    · {p.formas.pasado} · {p.formas.participio}
                  </span>
                )}
                <span className={estilos.es}>{p.es}</span>
                {p.ejemplo && (
                  <small>
                    {p.ejemplo.en} <em>{p.ejemplo.es}</em>
                  </small>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {unidad.dialogos.length > 0 && (
        <section className={estilos.bloque}>
          <h2>Diálogos</h2>
          <label className={estilos.velocidad}>
            <input type="checkbox" checked={traducir} onChange={(e) => setTraducir(e.target.checked)} />
            Mostrar la traducción
          </label>
          {unidad.dialogos.map((d) => (
            <div key={d.id} className={estilos.dialogo}>
              <div className={estilos.dialogoCabecera}>
                <strong>{d.titulo}</strong>
                {voz && (
                  <button type="button" className="boton" onClick={() => hablarVarias(d.lineas.map((l) => l.en))}>
                    🔊 Escuchar
                  </button>
                )}
              </div>
              {d.situacion && <p className={estilos.ayuda}>{d.situacion}</p>}
              {d.lineas.map((l, i) => (
                <p key={i} className={estilos.linea}>
                  <strong>{l.quien}:</strong> {l.en}
                  {traducir && <small>{l.es}</small>}
                </p>
              ))}
            </div>
          ))}
        </section>
      )}
    </article>
  );
}
