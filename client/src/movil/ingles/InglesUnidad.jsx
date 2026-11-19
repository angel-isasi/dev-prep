// Una unidad de inglés para leer: teoría corta, las palabras con su pronunciación y audio, y los diálogos.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../../lib/api.js";
import { hablar, hablarVarias, useHayVoz } from "../../lib/voz.js";
import { TeoriaIngles } from "./TeoriaIngles.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { Grabadora } from "../../components/Grabadora.jsx";
import estilos from "./Ingles.module.css";
import { IconoAudio, IconoEstrella } from "../../components/Iconos.jsx";

export function InglesUnidad() {
  const { id } = useParams();
  const [unidad, setUnidad] = useState(null);
  const [error, setError] = useState(null);
  const [traducir, setTraducir] = useState(false);
  const [mias, setMias] = useState({});
  useEffect(() => {
    api.misPalabras().then(setMias);
  }, []);
  // Reactivo: Chrome entrega las voces tarde y, si no, los botones de audio y el shadowing no aparecen
  const voz = useHayVoz();

  useEffect(() => {
    setUnidad(null);
    api.inglesUnidad(id).then(setUnidad, (e) => setError(e.message));
  }, [id]);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!unidad) return <Esqueleto variante="texto" />;

  return (
    <article className={`${estilos.pagina} ${estilos.paginaUnidad}`} data-area="ingles">
      <Link to="/ingles" className={estilos.volver}>
        ← Inglés
      </Link>
      <p className={estilos.etiqueta}>
        Nivel {unidad.nivel} · {unidad.palabras.length} palabras
      </p>
      <h1 className={estilos.titulo}>{unidad.titulo}</h1>
      {unidad.descripcion && <p className={estilos.ayuda}>{unidad.descripcion}</p>}

      <div className={estilos.accionesFila}>
        <Link
          to={`/leccion?ambito=ingles&unidad=${encodeURIComponent(unidad.id)}`}
          className="boton boton-primario"
          onClick={() => api.elegirUnidadIngles(unidad.id)}
        >
          Practicar esta unidad
        </Link>
      </div>

      <TeoriaIngles markdown={unidad.teoria} />

      <section className={estilos.bloque}>
        <h2>Palabras</h2>
        <ul className={estilos.palabras}>
          {unidad.palabras.map((p) => (
            <li key={p.id}>
              {voz && (
                <button
                  type="button"
                  className={estilos.audio}
                  onClick={() => hablar(p.ejemplo?.en ? `${p.en}. ${p.ejemplo.en}` : p.en)}
                  aria-label={`Escuchar ${p.en}`}
                >
                  <IconoAudio tamano={18} />
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
                <IconoEstrella tamano={18} llena={!!mias[p.id]} />
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

      {/* En pantalla grande, el shadowing y los diálogos van lado a lado */}
      <div className={estilos.practicaUnidad}>
      {voz && unidad.frases?.length > 0 && <Shadowing frases={unidad.frases} />}

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
                    <IconoAudio tamano={16} /> Escuchar
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
      </div>
    </article>
  );
}

/**
 * Shadowing: escuchas una frase y la repites ENCIMA del audio, imitando el ritmo y la entonación.
 * Después te grabas sola la frase y comparas. Es de las técnicas que más mejoran la pronunciación.
 */
function Shadowing({ frases }) {
  const [indice, setIndice] = useState(0);
  const [lento, setLento] = useState(true);
  const frase = frases[indice];
  return (
    <section className={estilos.bloque}>
      <h2>Shadowing: repite encima del audio</h2>
      <ol className={estilos.pasosShadowing}>
        <li>Escucha la frase una vez, leyendo el texto.</li>
        <li>
          Dale play otra vez y habla <strong>al mismo tiempo</strong> que la voz, como su sombra: copia el ritmo y la entonación.
        </li>
        <li>Grábate diciéndola sola y escúchate. Repite hasta que suene parecido.</li>
      </ol>
      <div className={estilos.shadowing}>
        <span className={estilos.pron}>
          Frase {indice + 1} de {frases.length}
        </span>
        <p className={estilos.fraseShadowing}>{frase.en}</p>
        <small className={estilos.es}>{frase.es}</small>
        <div className={estilos.accionesFila}>
          <button type="button" className="boton boton-primario" onClick={() => hablar(frase.en, { lento })}>
            <IconoAudio tamano={16} /> Escuchar
          </button>
          <label className={estilos.velocidad}>
            <input type="checkbox" checked={lento} onChange={(e) => setLento(e.target.checked)} /> Más lento
          </label>
        </div>
        <Grabadora key={frase.id} clave={`shadowing:${frase.id}`} maxSegundos={20} texto="Grabarme diciéndola" />
        <div className={estilos.accionesFila}>
          <button type="button" className="boton boton-fantasma" disabled={indice === 0} onClick={() => setIndice((i) => i - 1)}>
            ← Anterior
          </button>
          <button type="button" className="boton" disabled={indice + 1 >= frases.length} onClick={() => setIndice((i) => i + 1)}>
            Siguiente →
          </button>
        </div>
      </div>
    </section>
  );
}
