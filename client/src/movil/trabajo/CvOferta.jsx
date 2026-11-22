// CV para cada oferta: el botón que lo hace (en cada oferta y en "¿Encontraste una oferta?"), la página
// con el CV listo para descargar en PDF y, en Tu perfil, tu CV base y la lista de los que ya hiciste.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../../lib/api.js";
import { generarCvOferta } from "../../lib/cv-oferta.js";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { encabezadoDe } from "../../../../server/cv-oferta.js";
import base from "./Trabajo.module.css";
import estilos from "./CvOferta.module.css";

/**
 * "Hacer mi CV para esta oferta" o, si ya existe, el enlace para verlo.
 * @param {{ oferta: { id: string, texto: string, titulo?: string, empresa?: string, url?: string, puntaje?: number, fuente?: string, tieneCv?: boolean } }} props
 */
export function BotonCvOferta({ oferta }) {
  const ir = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [existe, setExiste] = useState(!!oferta.tieneCv);
  useEffect(() => {
    let vivo = true;
    if (oferta.id) api.cvOferta?.(oferta.id).then((c) => vivo && setExiste(!!c));
    return () => {
      vivo = false;
    };
  }, [oferta.id]);

  if (!api.cvOferta) return null;
  const corto = String(oferta.texto ?? "").trim().length < 40;
  if (existe)
    return (
      <Link to={`/trabajo/cv/${encodeURIComponent(oferta.id)}`} className="boton">
        Ver mi CV para esta oferta
      </Link>
    );
  return (
    <div className={estilos.boton}>
      <button
        type="button"
        className="boton boton-primario"
        disabled={cargando || corto}
        onClick={async () => {
          setCargando(true);
          setError(null);
          try {
            const hecho = await generarCvOferta({ ...oferta, oferta: [oferta.titulo, oferta.empresa, oferta.texto].filter(Boolean).join("\n") });
            ir(`/trabajo/cv/${encodeURIComponent(hecho.id)}`);
          } catch (e) {
            setError(e.message);
            setCargando(false);
          }
        }}
      >
        {cargando ? "Escribiendo tu CV para esta oferta (puede tardar un minuto)…" : "Hacer mi CV para esta oferta"}
      </button>
      {corto && <small className={base.tenue}>Pega el texto completo de la oferta.</small>}
      {error && <small className={estilos.error}>{error}</small>}
    </div>
  );
}

const ENCAJE = { alto: "Encaje alto", medio: "Encaje medio", bajo: "Encaje bajo" };

/** La página de un CV hecho para una oferta: la hoja (lo que se imprime) y al lado qué cambió y qué falta. */
export function PaginaCvOferta() {
  const { id } = useParams();
  const ir = useNavigate();
  const [registro, setRegistro] = useState(undefined);
  const [perfil, setPerfil] = useState(null);
  const [rehaciendo, setRehaciendo] = useState(false);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    api.cvOferta(id).then(setRegistro);
    api.cvBase().then((b) => setPerfil(encabezadoDe(b.texto)));
  }, [id]);

  if (registro === undefined || !perfil) return <Esqueleto variante="texto" />;
  if (!registro)
    return (
      <section className={estilos.pagina}>
        <p>Este CV ya no existe.</p>
        <Link to="/trabajo?pestana=perfil&ver=cv" className="boton">
          Ir a Mi CV
        </Link>
      </section>
    );

  const cv = registro.cv;
  const correo = cv.correo?.para || cv.correo?.asunto ? cv.correo : null;
  const textoCorreo = correo ? `Para: ${correo.para}\nAsunto: ${correo.asunto}\n\n${correo.cuerpo}` : "";

  async function rehacer() {
    setRehaciendo(true);
    setError(null);
    try {
      setRegistro(await generarCvOferta({ id, oferta: registro.oferta, titulo: registro.titulo, empresa: registro.empresa, url: registro.url, puntaje: registro.puntaje, fuente: registro.fuente }));
    } catch (e) {
      setError(e.message);
    } finally {
      setRehaciendo(false);
    }
  }

  return (
    <section className={estilos.pagina}>
      <div className={`${estilos.barra} ${base.noImprimir}`}>
        <Link to="/trabajo?pestana=perfil&ver=cv" className="boton boton-fantasma">
          ← Mi CV
        </Link>
        <button type="button" className="boton boton-primario" onClick={() => window.print()}>
          Descargar PDF
        </button>
        <button type="button" className="boton" disabled={rehaciendo} onClick={rehacer}>
          {rehaciendo ? "Rehaciéndolo…" : "Rehacer"}
        </button>
        {registro.url && (
          <a className="boton" href={registro.url} target="_blank" rel="noreferrer">
            Abrir la oferta
          </a>
        )}
        <button
          type="button"
          className="boton boton-fantasma"
          onClick={async () => {
            await api.borrarCvOferta(id);
            ir("/trabajo?pestana=perfil&ver=cv");
          }}
        >
          Borrar
        </button>
        {error && <small className={estilos.error}>{error}</small>}
      </div>

      <div className={estilos.cuerpo}>
        <article className={`${base.hoja} ${estilos.hoja}`}>
          <h1>{perfil.nombre || "Tu nombre"}</h1>
          <p className={base.titular}>{cv.titular}</p>
          {perfil.contacto.map((l) => (
            <p key={l} className={base.contacto}>
              {l}
            </p>
          ))}
          {cv.perfil && (
            <>
              <h2>Perfil</h2>
              <p>{cv.perfil}</p>
            </>
          )}
          {cv.experiencia?.length > 0 && (
            <>
              <h2>Experiencia</h2>
              {cv.experiencia.map((x, i) => (
                <div key={i} className={estilos.bloque}>
                  <p className={estilos.cabeza}>
                    <strong>{x.puesto}</strong>
                    <span>{x.periodo}</span>
                  </p>
                  {x.lugar && <p className={estilos.lugar}>{x.lugar}</p>}
                  <ul>
                    {x.puntos.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
          {cv.proyectos?.length > 0 && (
            <>
              <h2>Proyectos</h2>
              <ul>
                {cv.proyectos.map((p, i) => (
                  <li key={i}>
                    <strong>{p.titulo}</strong>
                    {p.enlace && ` (${p.enlace})`}: {p.texto}
                  </li>
                ))}
              </ul>
            </>
          )}
          {cv.educacion?.length > 0 && (
            <>
              <h2>Educación</h2>
              {cv.educacion.map((x, i) => (
                <div key={i} className={estilos.bloque}>
                  <p className={estilos.cabeza}>
                    <strong>{x.titulo}</strong>
                    <span>{x.periodo}</span>
                  </p>
                  {x.detalle && <p className={estilos.lugar}>{x.detalle}</p>}
                </div>
              ))}
            </>
          )}
          {cv.habilidades?.length > 0 && (
            <>
              <h2>Habilidades</h2>
              <dl className={estilos.habilidades}>
                {cv.habilidades.map((h, i) => (
                  <div key={i}>
                    <dt>{h.grupo}</dt>
                    <dd>{h.items}</dd>
                  </div>
                ))}
                {cv.idiomas && (
                  <div>
                    <dt>Idiomas</dt>
                    <dd>{cv.idiomas}</dd>
                  </div>
                )}
              </dl>
            </>
          )}
          {cv.cursos?.length > 0 && (
            <>
              <h2>Cursos y certificados</h2>
              <ul>
                {cv.cursos.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </article>

        <aside className={`${estilos.lado} ${base.noImprimir}`}>
          <div className={base.panel}>
            <strong>{registro.titulo}</strong>
            <small className={base.tenue}>
              {[registro.empresa, registro.fuente, registro.puntaje != null && `${registro.puntaje}/100`, registro.auto && "hecho solo"].filter(Boolean).join(" · ")}
            </small>
            <span className={estilos.encaje} data-encaje={cv.encaje}>
              {ENCAJE[cv.encaje] ?? cv.encaje}
            </span>
          </div>
          {cv.faltan?.length > 0 && (
            <div className={base.panel}>
              <strong>Lo que piden y te falta</strong>
              <small className={base.tenue}>No lo puse en el CV: no se inventa nada.</small>
              <ul>
                {cv.faltan.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {cv.cambios?.length > 0 && (
            <div className={base.panel}>
              <strong>Qué cambié de tu CV base</strong>
              <ul>
                {cv.cambios.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {cv.palabras?.length > 0 && (
            <div className={base.panel}>
              <strong>Palabras de la oferta que ya están en el CV</strong>
              <p className={base.tenue}>{cv.palabras.join(", ")}</p>
            </div>
          )}
          {correo && (
            <div className={base.panel}>
              <strong>Piden enviarlo por correo</strong>
              <pre className={estilos.correo}>{textoCorreo}</pre>
              <button
                type="button"
                className="boton"
                onClick={async () => {
                  await navigator.clipboard?.writeText(textoCorreo);
                  setCopiado(true);
                }}
              >
                {copiado ? "Copiado" : "Copiar el correo"}
              </button>
              <small className={base.tenue}>Adjunta el PDF y tu portafolio antes de enviarlo.</small>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

/** En Mi CV: los CV que ya hiciste para ofertas, del más nuevo al más viejo. */
export function ListaCvsOferta() {
  const [cvs, setCvs] = useState(null);
  useEffect(() => {
    api.cvsOferta?.().then(setCvs);
  }, []);
  if (!cvs) return null;
  return (
    <section className={base.panel}>
      <strong>Tus CV por oferta</strong>
      {cvs.length === 0 ? (
        <p className={base.tenue}>Todavía ninguno. Ábrelo desde una oferta (Ver detalle) o desde "¿Encontraste una oferta?" con "Hacer mi CV para esta oferta".</p>
      ) : (
        <ul className={estilos.lista}>
          {cvs.map((c) => (
            <li key={c.id}>
              <Link to={`/trabajo/cv/${encodeURIComponent(c.id)}`}>
                <strong>{c.titulo}</strong>
                <small>{[c.empresa, c.fecha, c.cv?.encaje && ENCAJE[c.cv.encaje], c.auto && "hecho solo"].filter(Boolean).join(" · ")}</small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
