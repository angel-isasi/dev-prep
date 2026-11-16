// Una lección estilo Duolingo: barra de avance arriba, un ítem a la vez, "Comprobar" abajo y
// una hoja verde o roja con la explicación. Lo fallado vuelve al final. Si cierras la app,
// la lección se guarda y la retomas desde Hoy.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { sincronizar } from "../../lib/sync-movil.js";
import { Markdown } from "../../components/Markdown.jsx";
import { SlidingNumber } from "../../components/ui/sliding-number.jsx";
import { armarLeccion, avance, crearSesion, ordenCorrecto, pasoActual, responder, resultadoNivel, resumen, semilla, terminada } from "./motor.js";
import { BotonAudio, ItemArmar, ItemEmparejar, ItemEntrevista, ItemOpcion, ItemOrdenar, ItemTarjeta, tituloDe } from "./Items.jsx";
import { armadoCorrecto } from "../../../../scripts/items/ingles.js";
import { hablar, hayVoz } from "../../lib/voz.js";
import estilos from "./LeccionMovil.module.css";

/** A dónde lleva "Ver más" según de dónde salió el ítem. */
function enlaceFuente(fuente) {
  if (!fuente) return null;
  if (fuente.tipo === "tema") return `/aprender/${fuente.id}`;
  if (fuente.tipo === "ejercicio") return `/practicar/${fuente.id}`;
  if (fuente.tipo === "referencia") return `/referencia?q=${encodeURIComponent(fuente.titulo ?? fuente.id)}`;
  if (fuente.tipo === "ingles") return `/ingles/unidad/${fuente.id}`;
  return null;
}

const textoCorrecta = (item) => item.opciones?.[item.correcta] ?? item.respuesta?.join(" ") ?? item.lineas?.join("\n") ?? "";

export function LeccionMovil() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const [sesion, setSesion] = useState(null);
  const [error, setError] = useState(null);
  const [elegida, setElegida] = useState(null); // índice en opción/hueco
  const [orden, setOrden] = useState([]); // índices de líneas en ordenar
  const [retro, setRetro] = useState(null); // { correcto, permitirEquivalente }
  const [final, setFinal] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const ambito = params.get("ambito") === "ingles" ? "ingles" : "programacion";
  const inicio = ambito === "ingles" ? "/ingles" : "/";

  // Arma la lección (o retoma la que quedó a medias)
  useEffect(() => {
    api.lecciones(ambito).then(async (d) => {
      setUnidades(d.unidades);
      if (params.get("modo") === "debiles" && api.mapa) d = { ...d, unidades: (await api.mapa()).debiles };
      if (params.get("retomar") && d.enCurso && !terminada(d.enCurso)) return setSesion(d.enCurso);
      const unidad = params.get("unidad") ?? d.unidadActual;
      const modo = params.get("modo") ?? "normal";
      const pasos = armarLeccion({ ...d, unidad, modo, conVoz: hayVoz(), azar: semilla(`${d.hoy}-${unidad}-${modo}-${Date.now()}`) });
      if (pasos.length === 0) return setError(modo === "errores" ? "No tienes errores pendientes. ¡Bien!" : "No hay ítems para esta unidad todavía.");
      const nueva = crearSesion(pasos, { unidad, modo, hoy: d.hoy, ambito });
      api.guardarLeccionEnCurso(nueva);
      setSesion(nueva);
    }, (e) => setError(e.message));
  }, [params, ambito]);

  const paso = sesion ? pasoActual(sesion) : null;

  const limpiar = () => {
    setElegida(null);
    setOrden([]);
    setRetro(null);
  };

  /** Registra la nota final del ítem (si quedó decidida) y avanza. */
  const avanzar = useCallback(
    async (respuesta) => {
      const { sesion: siguiente, nota } = responder(sesion, respuesta);
      if (nota) {
        if (paso.tipo === "entrevista") await api.calificar(paso.pregunta.id, nota);
        else await api.calificarItem(paso.clave, nota);
      }
      limpiar();
      if (terminada(siguiente)) {
        const r = resumen(siguiente);
        const segundos = siguiente.inicio ? (Date.now() - siguiente.inicio) / 1000 : 0;
        await api.completarLeccion(r.xp, { ambito, segundos });
        if (siguiente.modo === "nivel") {
          const nivel = resultadoNivel(siguiente, unidades);
          await api.guardarNivelIngles(nivel.empiezaEn);
          r.nivel = unidades.find((u) => u.id === nivel.empiezaEn) ?? null;
        }
        celebrar();
        sincronizar(); // si hay internet, la laptop se entera de esta lección
        setFinal(r);
      } else {
        api.guardarLeccionEnCurso(siguiente);
      }
      setSesion(siguiente);
    },
    [sesion, paso, ambito, unidades],
  );

  function comprobar() {
    const item = paso.item;
    let correcto;
    if (item.tipo === "ordenar") correcto = ordenCorrecto(item, orden.map((i) => item.lineas[i]));
    else if (item.tipo === "armar") correcto = armadoCorrecto(item, orden.map((i) => item.fichas[i]));
    else correcto = elegida === item.correcta;
    // En inglés, oír la respuesta correcta ayuda a fijarla
    if (item.audioRespuesta || (item.tipo === "armar" && item.audio)) hablar(item.audioRespuesta ?? item.audio);
    navigator.vibrate?.(correcto ? 25 : [40, 60, 40]);
    setRetro({ correcto, permitirEquivalente: item.tipo === "ordenar" && !correcto });
  }

  const alEmparejar = useCallback(
    (errores) => {
      setRetro({ correcto: errores === 0, errores });
    },
    [],
  );

  async function reportar() {
    await api.reportar(paso.clave);
    setRetro((r) => ({ ...r, reportado: true }));
  }

  function salir() {
    if (window.confirm("¿Salir de la lección? Tu avance se guarda y la puedes retomar después.")) navegar(inicio);
  }

  const progreso = useMemo(() => (sesion ? avance(sesion) : 0), [sesion]);

  if (error) {
    return (
      <div className={estilos.mensaje}>
        <p>{error}</p>
        <Link to={inicio} className="boton boton-primario">
          Volver
        </Link>
      </div>
    );
  }
  if (!sesion) return <div className={estilos.mensaje}>Armando tu lección…</div>;

  if (final) {
    return (
      <div className={estilos.final}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={estilos.finalTitulo}>
          {final.nivel !== undefined ? "¡Prueba terminada!" : "¡Lección completa!"}
        </motion.div>
        {final.nivel && (
          <p className={estilos.nivel}>
            Empiezas en <strong>{final.nivel.titulo}</strong> ({final.nivel.nivel}). Lo anterior ya lo dominas; igual puedes repasarlo cuando quieras.
          </p>
        )}
        <div className={estilos.cifras}>
          <div>
            <strong>
              <SlidingNumber number={final.aciertos} />
              <small>/{final.total}</small>
            </strong>
            <span>a la primera</span>
          </div>
          <div data-tipo="xp">
            <strong>
              +<SlidingNumber number={final.xp} />
            </strong>
            <span>XP</span>
          </div>
        </div>
        {final.fallados.length > 0 && (
          <div className={estilos.repasar}>
            <span>Para repasar</span>
            {final.fallados.map((p) => {
              const enlace = enlaceFuente(p.item?.fuente);
              return enlace ? (
                <Link key={p.clave} to={enlace}>
                  {p.item.fuente.titulo ?? p.clave} →
                </Link>
              ) : null;
            })}
          </div>
        )}
        <div className={estilos.acciones}>
          <button type="button" className="boton boton-primario" onClick={() => navegar(0)}>
            Otra lección
          </button>
          <Link to={inicio} className="boton">
            {ambito === "ingles" ? "Volver a Inglés" : "Volver a Hoy"}
          </Link>
        </div>
      </div>
    );
  }

  const item = paso.item;
  const puedeComprobar =
    !retro &&
    item &&
    (item.tipo === "opcion" || item.tipo === "hueco"
      ? elegida !== null
      : item.tipo === "ordenar"
        ? orden.length === item.lineas.length
        : item.tipo === "armar"
          ? orden.length > 0
          : false);

  return (
    <div className={estilos.leccion}>
      <header className={estilos.barra}>
        <button type="button" className={estilos.cerrar} onClick={salir} aria-label="Salir de la lección">
          ✕
        </button>
        <div className={estilos.avance}>
          <motion.div animate={{ width: `${Math.max(4, progreso * 100)}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={`${sesion.posicion}-${paso.clave}`}
          className={estilos.contenido}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
        >
          <h1 className={estilos.titulo}>
            {sesion.fallados.includes(sesion.cola[sesion.posicion]) && <span className={estilos.denuevo}>Otra vez</span>}
            {tituloDe(paso)}
          </h1>

          {paso.tipo === "entrevista" && <ItemEntrevista pregunta={paso.pregunta} alCalificar={(nota) => avanzar({ nota })} />}
          {paso.tipo === "tarjeta" && <ItemTarjeta item={item} alCalificar={(nota) => avanzar({ nota })} />}
          {(paso.tipo === "opcion" || paso.tipo === "hueco") && (
            <ItemOpcion item={item} elegida={elegida} alElegir={setElegida} bloqueado={!!retro} correcta={item.correcta} />
          )}
          {paso.tipo === "ordenar" && <ItemOrdenar item={item} elegidas={orden} alCambiar={setOrden} bloqueado={!!retro} />}
          {paso.tipo === "armar" && <ItemArmar item={item} elegidas={orden} alCambiar={setOrden} bloqueado={!!retro} />}
          {paso.tipo === "emparejar" && <ItemEmparejar item={item} alCompletar={alEmparejar} />}
        </motion.main>
      </AnimatePresence>

      {/* Pie: Comprobar, o la hoja con el resultado */}
      {item && !retro && paso.tipo !== "emparejar" && paso.tipo !== "tarjeta" && (
        <footer className={estilos.pie}>
          <button type="button" className={`boton boton-primario ${estilos.grande}`} disabled={!puedeComprobar} onClick={comprobar}>
            Comprobar
          </button>
        </footer>
      )}

      <AnimatePresence>
        {retro && (
          <motion.footer
            className={estilos.hoja}
            data-correcto={retro.correcto}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <strong className={estilos.veredicto}>
              {retro.correcto ? "¡Bien!" : paso.tipo === "emparejar" ? `Con ${retro.errores} ${retro.errores === 1 ? "error" : "errores"}` : "No es así"}
            </strong>
            {!retro.correcto && item.tipo === "ordenar" && (
              <div className={estilos.correcta}>
                <span>Orden correcto</span>
                <Markdown>{"```" + (item.lenguaje ?? "js") + "\n" + item.lineas.join("\n") + "\n```"}</Markdown>
              </div>
            )}
            {!retro.correcto && item.tipo === "armar" && (
              <div className={estilos.correcta}>
                <span>Respuesta correcta</span>
                <p>{item.respuesta.join(" ")}</p>
              </div>
            )}
            {!retro.correcto && (item.tipo === "opcion" || item.tipo === "hueco") && (
              <div className={estilos.correcta}>
                <span>Respuesta correcta</span>
                <Markdown>{textoCorrecta(item)}</Markdown>
              </div>
            )}
            {(item.audioRespuesta || (item.fuente?.tipo === "ingles" && item.audio)) && <BotonAudio texto={item.audioRespuesta ?? item.audio} />}
            {item.explicacion && (
              <div className={estilos.explicacion}>
                <Markdown>{item.explicacion}</Markdown>
              </div>
            )}
            <div className={estilos.enlaces}>
              {enlaceFuente(item.fuente) && (
                <Link to={enlaceFuente(item.fuente)} onClick={() => api.guardarLeccionEnCurso(sesion)}>
                  Ver más →
                </Link>
              )}
              {retro.reportado ? (
                <span>Reportada: no volverá a salir.</span>
              ) : (
                <button type="button" onClick={reportar}>
                  Reportar pregunta
                </button>
              )}
            </div>
            <div className={estilos.botonesHoja}>
              {retro.permitirEquivalente && (
                <button type="button" className="boton" onClick={() => avanzar({ correcto: true })}>
                  Mi orden también vale
                </button>
              )}
              <button type="button" className={`boton boton-primario ${estilos.grande}`} onClick={() => avanzar({ correcto: retro.correcto })}>
                Continuar
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
