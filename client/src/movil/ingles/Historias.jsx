// Historias (la serie de Ana, estilo "Stories") y roleplays (tú eliges qué decir).
// Lista en /ingles/historias; cada una se juega paso a paso en /ingles/historia/:id y /ingles/roleplay/:id.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { feedback } from "../../lib/feedback.js";
import { callar, hablar, hayVoz } from "../../lib/voz.js";
import { Markdown } from "../../components/Markdown.jsx";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { Bit } from "../../components/Bit.jsx";
import { barajar, semilla } from "../leccion/motor.js";
import estilos from "./Historias.module.css";
import { IconoEntrevistas } from "../../components/Iconos.jsx";

// Orden de las opciones barajado pero estable (la misma pregunta siempre igual): así la correcta no cae siempre en el mismo lugar.
const ordenDe = (opciones, clave) => barajar(opciones.map((_, i) => i), semilla(clave));

const ETAPAS = { basico: "Base (A1 a A2)", intermedio: "Intermedio (B1)", trabajo: "Inglés de trabajo (B1 a B2)", avanzado: "Avanzado (B2)", superior: "Superior (C1)", dominio: "Dominio (C2)" };
const XP_HISTORIA = { base: 20, porAcierto: 5 };

/** Lista de historias y roleplays por etapa; marca las hechas y sugiere la de tu unidad. */
export function ListaHistorias() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    api.historiasIngles().then(setDatos, () => setError(true));
  }, []);
  if (error) return <p className={estilos.mensaje}>No se pudieron cargar las historias. Vuelve a intentarlo.</p>;
  if (!datos) return <Esqueleto variante="lista" />;
  const sugerida = datos.historias.find((h) => h.unidad === datos.unidad && !datos.hechas[h.id]) ?? datos.historias.find((h) => !datos.hechas[h.id]);

  return (
    <section className={`${estilos.pagina} ${estilos.paginaLista}`} data-area="ingles">
      <CabeceraPagina etiqueta="Inglés" titulo="Historias" resaltado="y roleplays">
        Historias cortas con audio. En los roleplays tú eliges qué decir.
      </CabeceraPagina>
      {sugerida && (
        <Link to={`/ingles/historia/${sugerida.id}`} className={estilos.sugerida}>
          <Bit animo="feliz" tamano={52} />
          <div>
            <small>Te toca</small>
            <strong>{sugerida.titulo}</strong>
            <span>{sugerida.situacion}</span>
          </div>
        </Link>
      )}
      {Object.entries(ETAPAS).map(([etapa, titulo]) => {
        const historias = datos.historias.filter((h) => h.etapa === etapa);
        const roleplays = datos.roleplays.filter((r) => r.etapa === etapa);
        if (!historias.length && !roleplays.length) return null;
        return (
          <div key={etapa} className={estilos.etapa}>
            <h2>{titulo}</h2>
            <ol className={estilos.lista}>
              {historias.map((h, i) => (
                <li key={h.id}>
                  <Link to={`/ingles/historia/${h.id}`} className={estilos.fila} data-hecha={!!datos.hechas[h.id]}>
                    <span className={estilos.numero}>{datos.hechas[h.id] ? "✓" : i + 1}</span>
                    <span>
                      <strong>{h.titulo}</strong>
                      <small>{h.unidadTitulo}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {roleplays.length > 0 && (
              <>
                <h3>Roleplays</h3>
                <ol className={estilos.lista}>
                  {roleplays.map((r) => (
                    <li key={r.id}>
                      <Link to={`/ingles/roleplay/${r.id}`} className={estilos.fila} data-hecha={!!datos.hechas[r.id]} data-tipo="roleplay">
                        <span className={estilos.numero}>{datos.hechas[r.id] ? "✓" : <IconoEntrevistas />}</span>
                        <span>
                          <strong>{r.titulo}</strong>
                          <small>{r.situacion}</small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

/** Opciones de un reto (pregunta o completa): se elige, se comprueba y se explica. */
function Reto({ paso, alTerminar }) {
  const [elegida, setElegida] = useState(null);
  const listo = elegida !== null;
  const correcto = elegida === paso.correcta;
  const orden = useMemo(() => ordenDe(paso.opciones, paso.en ?? paso.pregunta ?? ""), [paso]);
  return (
    <div className={estilos.reto}>
      {paso.tipo === "completa" ? (
        <p className={estilos.linea}>
          <strong>{paso.quien}:</strong> <span lang="en">{paso.en}</span>
        </p>
      ) : (
        <div className={estilos.pregunta}>
          <Markdown>{paso.pregunta}</Markdown>
        </div>
      )}
      <div className={estilos.opciones}>
        {orden.map((i) => [paso.opciones[i], i]).map(([o, i]) => (
          <button
            key={o}
            type="button"
            className={estilos.opcion}
            disabled={listo}
            data-estado={listo ? (i === paso.correcta ? "bien" : i === elegida ? "mal" : "") : ""}
            onClick={() => {
              setElegida(i);
              (i === paso.correcta ? feedback.acierto : feedback.fallo)();
              if (paso.tipo === "completa" && hayVoz()) hablar(paso.en.replace("___", paso.opciones[paso.correcta]));
            }}
          >
            {o}
          </button>
        ))}
      </div>
      {listo && (
        <motion.div className={estilos.explicacion} data-correcto={correcto} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Markdown>{paso.explicacion}</Markdown>
          {paso.es && <small data-sin-inmersion>{paso.es}</small>}
          <button type="button" className="boton boton-primario" onClick={() => alTerminar(correcto)}>
            Continuar
          </button>
        </motion.div>
      )}
    </div>
  );
}

/** Final de historia o roleplay: XP y volver. */
function Final({ aciertos, retos, xp, otra }) {
  return (
    <motion.div className={estilos.final} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <Bit animo="fiesta" tamano={80} dice={aciertos === retos ? "¡Todo bien a la primera!" : `${aciertos} de ${retos} a la primera.`} />
      <strong className={estilos.xp}>+{xp} XP</strong>
      <div className={estilos.acciones}>
        <Link to="/ingles/historias" className="boton boton-primario">
          {otra}
        </Link>
        <Link to="/ingles" className="boton">
          Volver a Inglés
        </Link>
      </div>
    </motion.div>
  );
}

function useHistoria(tipo, id) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    api.historiasIngles().then(
      (d) => {
        const lista = tipo === "historia" ? d.historias : d.roleplays;
        const encontrada = lista.find((h) => h.id === id);
        if (encontrada) setItem(encontrada);
        else setError("No encontré esa historia.");
      },
      () => setError("No se pudo cargar. Vuelve a intentarlo."),
    );
  }, [tipo, id]);
  // Al salir de la historia o del roleplay la voz se corta (si no, sigue leyendo en la otra pantalla)
  useEffect(() => () => callar(), []);
  return { item, error };
}

/** Una historia: las líneas van apareciendo (con audio) y los retos se responden en el camino. */
export function HistoriaMovil() {
  const { id } = useParams();
  const { item, error } = useHistoria("historia", id);
  const [posicion, setPosicion] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [verTraduccion, setVerTraduccion] = useState(false);
  const [final, setFinal] = useState(null);
  const [resultados, setResultados] = useState({}); // posición del reto -> si lo acertaste
  const inicio = useRef(Date.now());
  const abajo = useRef(null);
  const navegar = useNavigate();

  const pasos = item?.pasos ?? [];
  const retos = useMemo(() => pasos.filter((p) => p.tipo).length, [pasos]);
  const actual = pasos[posicion];

  useEffect(() => {
    if (actual && !actual.tipo && hayVoz()) hablar(actual.en);
    abajo.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [posicion, actual]);

  async function avanzar(acerto) {
    const nuevos = aciertos + (acerto ? 1 : 0);
    setAciertos(nuevos);
    if (actual?.tipo) setResultados((r) => ({ ...r, [posicion]: !!acerto }));
    if (posicion + 1 >= pasos.length) {
      const xp = XP_HISTORIA.base + nuevos * XP_HISTORIA.porAcierto;
      await api.terminarHistoria(item.id, { xp, segundos: (Date.now() - inicio.current) / 1000 });
      celebrar("leccion");
      setFinal({ xp, aciertos: nuevos });
    } else setPosicion(posicion + 1);
  }

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!item) return <Esqueleto variante="lista" />;
  if (final) return <Final aciertos={final.aciertos} retos={retos} xp={final.xp} otra="Otra historia" />;

  const mostradas = pasos.slice(0, posicion + 1);
  return (
    <div className={estilos.jugar}>
      <header className={estilos.barra}>
        <button type="button" className={estilos.cerrar} onClick={() => navegar("/ingles/historias")} aria-label="Salir">
          ✕
        </button>
        <div className={estilos.avance}>
          <motion.div animate={{ width: `${Math.max(4, ((posicion + 1) / pasos.length) * 100)}%` }} />
        </div>
        <label className={estilos.traducir}>
          <input type="checkbox" checked={verTraduccion} onChange={(e) => setVerTraduccion(e.target.checked)} /> Español
        </label>
      </header>
      <h1 className={estilos.tituloHistoria}>{item.titulo}</h1>
      <p className={estilos.situacion}>{item.situacion}</p>
      <div className={estilos.conversacion}>
        <AnimatePresence initial={false}>
          {mostradas.map((p, i) =>
            p.tipo ? (
              i === posicion ? (
                <Reto key={i} paso={p} alTerminar={avanzar} />
              ) : (
                <p key={i} className={estilos.lineaRespondida}>
                  {p.tipo === "completa" ? (
                    <>
                      <strong>{p.quien}:</strong> {p.en.replace("___", p.opciones[p.correcta])}
                    </>
                  ) : (
                    <>
                      {resultados[i] ? "✓" : "✗"} {p.pregunta.replace(/[*_]/g, "")}
                    </>
                  )}
                </p>
              )
            ) : (
              <motion.div key={i} className={estilos.burbuja} data-ana={p.quien === "Ana"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <span className={estilos.quien}>{p.quien}</span>
                <button type="button" className={estilos.texto} onClick={() => hablar(p.en)} lang="en">
                  {p.en}
                </button>
                {(verTraduccion || i < posicion) && <small data-sin-inmersion>{p.es}</small>}
              </motion.div>
            ),
          )}
        </AnimatePresence>
        <div ref={abajo} />
      </div>
      {actual && !actual.tipo && (
        <footer className={estilos.pie}>
          <button type="button" className="boton boton-primario" onClick={() => avanzar(false)}>
            Continuar
          </button>
        </footer>
      )}
    </div>
  );
}

/** Un roleplay: el otro habla y tú eliges qué responder. Si te equivocas, ves por qué y vuelves a elegir. */
export function RoleplayMovil() {
  const { id } = useParams();
  const { item, error } = useHistoria("roleplay", id);
  const [posicion, setPosicion] = useState(0);
  const [errores, setErrores] = useState(0);
  const [fallidas, setFallidas] = useState([]); // índices de opciones que ya fallaste en este turno
  const [explicacion, setExplicacion] = useState(null);
  const [final, setFinal] = useState(null);
  const inicio = useRef(Date.now());
  const abajo = useRef(null);
  const navegar = useNavigate();

  const turnos = item?.turnos ?? [];
  const tuyos = turnos.filter((t) => t.opciones).length;
  const actual = turnos[posicion];
  const orden = useMemo(() => (actual?.opciones ? ordenDe(actual.opciones, actual.opciones.map((o) => o.en).join("|")) : []), [actual]);

  useEffect(() => {
    if (actual && !actual.opciones && hayVoz()) hablar(actual.en);
    abajo.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [posicion, actual]);

  async function siguiente() {
    setFallidas([]);
    setExplicacion(null);
    if (posicion + 1 >= turnos.length) {
      const aciertos = Math.max(0, tuyos - errores);
      const xp = XP_HISTORIA.base + aciertos * XP_HISTORIA.porAcierto;
      await api.terminarHistoria(item.id, { xp, segundos: (Date.now() - inicio.current) / 1000 });
      celebrar("leccion");
      setFinal({ xp, aciertos });
    } else setPosicion(posicion + 1);
  }

  function elegir(o, i) {
    if (o.correcta) {
      feedback.acierto();
      if (hayVoz()) hablar(o.en);
      setExplicacion({ correcta: true, texto: o.explicacion });
    } else {
      feedback.fallo();
      if (!fallidas.length) setErrores((e) => e + 1);
      setFallidas([...fallidas, i]);
      setExplicacion({ correcta: false, texto: o.explicacion });
    }
  }

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!item) return <Esqueleto variante="lista" />;
  if (final) return <Final aciertos={final.aciertos} retos={tuyos} xp={final.xp} otra="Otro roleplay" />;

  const historial = turnos.slice(0, posicion);
  const respuestaDe = (t) => t.opciones?.find((o) => o.correcta);
  return (
    <div className={estilos.jugar}>
      <header className={estilos.barra}>
        <button type="button" className={estilos.cerrar} onClick={() => navegar("/ingles/historias")} aria-label="Salir">
          ✕
        </button>
        <div className={estilos.avance}>
          <motion.div animate={{ width: `${Math.max(4, (posicion / turnos.length) * 100)}%` }} />
        </div>
      </header>
      <h1 className={estilos.tituloHistoria}>{item.titulo}</h1>
      <p className={estilos.situacion}>
        {item.situacion} Tú eres <strong>{item.tu ?? "Ana"}</strong>.
      </p>
      <div className={estilos.conversacion}>
        {historial.map((t, i) => {
          const linea = t.opciones ? { quien: item.tu ?? "Ana", ...respuestaDe(t) } : t;
          return (
            <div key={i} className={estilos.burbuja} data-ana={!!t.opciones}>
              <span className={estilos.quien}>{linea.quien}</span>
              <button type="button" className={estilos.texto} onClick={() => hablar(linea.en)} lang="en">
                {linea.en}
              </button>
              {linea.es && <small data-sin-inmersion>{linea.es}</small>}
            </div>
          );
        })}
        {actual && !actual.opciones && (
          <motion.div key={posicion} className={estilos.burbuja} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className={estilos.quien}>{actual.quien}</span>
            <button type="button" className={estilos.texto} onClick={() => hablar(actual.en)} lang="en">
              {actual.en}
            </button>
            <small data-sin-inmersion>{actual.es}</small>
          </motion.div>
        )}
        {actual?.opciones && (
          <div className={estilos.reto}>
            <p className={estilos.ayuda}>¿Qué dices?</p>
            <div className={estilos.opciones}>
              {orden.map((i) => [actual.opciones[i], i]).map(([o, i]) => (
                <button
                  key={o.en}
                  type="button"
                  className={estilos.opcion}
                  lang="en"
                  disabled={fallidas.includes(i) || explicacion?.correcta}
                  data-estado={fallidas.includes(i) ? "mal" : explicacion?.correcta && o.correcta ? "bien" : ""}
                  onClick={() => elegir(o, i)}
                >
                  {o.en}
                </button>
              ))}
            </div>
            {explicacion && (
              <motion.div className={estilos.explicacion} data-correcto={explicacion.correcta} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Markdown>{explicacion.texto}</Markdown>
                {explicacion.correcta ? (
                  <button type="button" className="boton boton-primario" onClick={siguiente}>
                    Continuar
                  </button>
                ) : (
                  <small>Elige otra.</small>
                )}
              </motion.div>
            )}
          </div>
        )}
        <div ref={abajo} />
      </div>
      {actual && !actual.opciones && (
        <footer className={estilos.pie}>
          <button type="button" className="boton boton-primario" onClick={siguiente}>
            Continuar
          </button>
        </footer>
      )}
    </div>
  );
}
