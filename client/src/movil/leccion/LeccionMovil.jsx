// Una lección estilo Duolingo: barra de avance arriba, un ítem a la vez, "Comprobar" abajo y
// una hoja verde o roja con la explicación. Lo fallado vuelve al final. Si cierras la app,
// la lección se guarda y la retomas desde Hoy.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { sonidos } from "../../lib/sonidos.js";
import { sincronizar } from "../../lib/sync-movil.js";
import { Markdown } from "../../components/Markdown.jsx";
import { SlidingNumber } from "../../components/ui/sliding-number.jsx";
import { armarLeccion, avance, crearSesion, HITOS_COMBO, ordenCorrecto, pasoActual, responder, resultadoNivel, resumen, semilla, terminada, VIDAS } from "./motor.js";
import { BotonAudio, ItemArmar, ItemEmparejar, ItemEntrevista, ItemEscribir, ItemHablar, ItemOpcion, ItemOrdenar, ItemTarjeta, tituloDe } from "./Items.jsx";
import { armadoCorrecto, escrituraCorrecta } from "../../../../scripts/items/ingles.js";
import { hablar, hayMicrofono, hayVoz, useHayVoz, vocesListas } from "../../lib/voz.js";
import { elegirVariante, emparejarDe, variarPasos } from "./variantes.js";
import { Bit, fraseDeBit } from "../../components/Bit.jsx";
import { despuesDe, leccionDe, planUnidad, PRUEBA, pruebaAprobada } from "./plan.js";
import estilos from "./LeccionMovil.module.css";
import { IconoCorazon, IconoLlamita, IconoRepetir } from "../../components/Iconos.jsx";
import { feedback } from "../../lib/feedback.js";

/** A dónde lleva "Ver más" según de dónde salió el ítem. */
function enlaceFuente(fuente) {
  if (!fuente) return null;
  if (fuente.tipo === "tema") return `/aprender/${fuente.id}`;
  if (fuente.tipo === "ejercicio") return `/practicar/${fuente.id}`;
  if (fuente.tipo === "referencia") return `/referencia?q=${encodeURIComponent(fuente.titulo ?? fuente.id)}`;
  if (fuente.tipo === "ingles") return `/ingles/unidad/${fuente.id}`;
  return null;
}

const textoCorrecta = (item) => item.opciones?.[item.correcta] ?? (Array.isArray(item.respuesta) ? item.respuesta.join(" ") : item.respuesta) ?? item.lineas?.join("\n") ?? "";

/** Inglés: mete un "une las parejas" (no calificado) a mitad de la lección, con palabras que ya viste. */
function conEmparejar(pasos, d, unidad, azar) {
  const vistas = d.items.filter((it) => it.unidad === unidad && it.concepto === "palabra" && (d.registros[it.clave]?.caja ?? 0) >= 1);
  const enLeccion = pasos.map((p) => d.items.find((it) => it.clave === p.clave)).filter(Boolean);
  const par = emparejarDe(vistas.length >= 4 ? vistas : enLeccion, azar);
  if (!par) return pasos;
  const mitad = Math.floor(pasos.length / 2);
  return [...pasos.slice(0, mitad), { clave: par.clave, tipo: "emparejar", item: par }, ...pasos.slice(mitad)];
}

/** Una línea corta de una pregunta en markdown (para la lista de falladas). */
const textoCorto = (md) => String(md ?? "").replace(/[*_~`#>]/g, "").split("\n").find((l) => l.trim())?.slice(0, 80) ?? "";

/** Al terminar: cómo quedó la unidad, una rayita por lección (la que acabas de hacer, resaltada). */
function AvanceUnidad({ unidad }) {
  const { plan, hecha } = unidad;
  const requeridas = plan.grupos.filter((g) => !g.opcional).flatMap((g) => g.lecciones);
  return (
    <div className={estilos.unidadFinal}>
      <div className={estilos.unidadFinalCabeza}>
        <span>{unidad.titulo}</span>
        <strong>
          {plan.hechas} de {plan.total} lecciones
        </strong>
      </div>
      <div className={estilos.segmentos} aria-hidden>
        {requeridas.map((l) => (
          <i key={l.id} data-hecha={l.hecha} data-esta={l.id === hecha?.id} />
        ))}
      </div>
      <small>
        {hecha?.hecha ? `Terminaste "${hecha.nombre}". ` : ""}
        {plan.completa ? "Unidad completa: ya puedes hacer su prueba." : `Llevas ${plan.preguntas.aprendidos} de ${plan.preguntas.total} preguntas aprendidas en la unidad.`}
      </small>
    </div>
  );
}

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
  const [escrito, setEscrito] = useState(""); // en escribir
  const [hito, setHito] = useState(null); // combo que se celebra
  const ambito = params.get("ambito") === "ingles" ? "ingles" : "programacion";
  // Programación: si vienes de una unidad (Lecciones), vuelves ahí
  const inicio = ambito === "ingles" ? "/ingles" : params.get("unidad") ? "/camino" : "/";
  // Si las voces llegan con la lección ya abierta, la pantalla se vuelve a pintar y aparecen los botones de audio
  useHayVoz();

  // Arma la lección (o retoma la que quedó a medias)
  useEffect(() => {
    // Al pasar a la siguiente lección (cambian los parámetros) se empieza de cero
    setFinal(null);
    setSesion(null);
    setError(null);
    // Si cambian los parámetros (o React monta dos veces en desarrollo), la lección vieja no pisa a la nueva
    let vigente = true;
    api.lecciones(ambito).then(async (d) => {
      // Inglés: Chrome entrega las voces tarde. Se esperan un momento para que la lección no salga sin ejercicios de escuchar
      if (ambito === "ingles") await vocesListas();
      setUnidades(d.unidades);
      if (params.get("modo") === "debiles" && api.mapa) d = { ...d, unidades: (await api.mapa()).debiles };
      if (params.get("modo") === "mispalabras") {
        const mias = new Set(Object.keys(await api.misPalabras()));
        d = { ...d, items: d.items.filter((it) => /^en:/.test(it.clave) && mias.has(it.clave.slice(3))) };
      }
      if (params.get("claves")) {
        const estas = new Set(params.get("claves").split(","));
        d = { ...d, items: d.items.filter((it) => estas.has(it.clave)) };
      }
      if (!vigente) return;
      if (params.get("retomar") && d.enCurso && !terminada(d.enCurso)) return setSesion(d.enCurso);
      const unidad = params.get("unidad") ?? d.unidadActual;
      // Una lección fija de la unidad (plan.js): solo sus preguntas
      const parte = params.get("parte") && ambito === "programacion" ? leccionDe(planUnidad(d.items, d.registros, unidad, d.reportados), params.get("parte")) : null;
      if (parte) {
        const estas = new Set(parte.claves);
        d = { ...d, items: d.items.filter((it) => estas.has(it.clave)) };
      }
      const modo = parte ? "parte" : params.get("modo") === "mispalabras" || params.get("claves") ? "todos" : (params.get("modo") ?? "normal");
      const azar = semilla(`${d.hoy}-${unidad}-${modo}-${Date.now()}`);
      const ingles = ambito === "ingles";
      // En inglés cada concepto se pregunta según cuánto lo dominas (ver variantes.js)
      const conVoz = hayVoz();
      const variante = ingles ? (it, op) => elegirVariante(it, d.registros[it.clave], { conVoz, conMicro: hayMicrofono(), azar, ...op }) : undefined;
      let pasos = armarLeccion({ ...d, unidad, modo, conVoz, azar, variante });
      if (ingles && modo === "normal") pasos = conEmparejar(pasos, d, unidad, azar);
      if (ingles && (modo === "normal" || modo === "rapida")) pasos = variarPasos(pasos, new Map(d.items.map((it) => [it.clave, it])), { conVoz });
      if (pasos.length === 0)
        return setError(
          modo === "errores" ? "No tienes errores pendientes. ¡Bien!" : modo === "examen" ? "Todavía no practicaste suficiente esta semana para un examen: haz unas lecciones primero." : "No hay ítems para esta unidad todavía.",
        );
      const nueva = crearSesion(pasos, { unidad, modo, hoy: d.hoy, ambito, parte: parte?.id ?? null, vidas: ingles && d.extra?.vidas && modo !== "nivel" ? VIDAS : null });
      api.guardarLeccionEnCurso(nueva);
      setSesion(nueva);
    }, (e) => vigente && setError(e.message));
    return () => {
      vigente = false;
    };
  }, [params, ambito]);

  const paso = sesion ? pasoActual(sesion) : null;

  const limpiar = () => {
    setElegida(null);
    setOrden([]);
    setRetro(null);
    setEscrito("");
  };

  /** Registra la nota final del ítem (si quedó decidida) y avanza. */
  const avanzar = useCallback(
    async (respuesta) => {
      const { sesion: siguiente, nota } = responder(sesion, respuesta);
      if (nota && !paso.item?.extra) {
        if (paso.tipo === "entrevista") await api.calificar(paso.pregunta.id, nota);
        else await api.calificarItem(paso.clave, nota);
      }
      limpiar();
      // Combo: se celebra al llegar a 5, 10, 15...
      if (HITOS_COMBO.includes(siguiente.combo) && siguiente.combo !== sesion.combo) {
        setHito(siguiente.combo);
        sonidos.meta();
        setTimeout(() => setHito(null), 1400);
      }
      if (terminada(siguiente)) {
        const r = resumen(siguiente);
        const segundos = siguiente.inicio ? (Date.now() - siguiente.inicio) / 1000 : 0;
        await api.completarLeccion(r.xp, { ambito, segundos });
        if (ambito === "ingles" && api.registrarLeccionIngles) await api.registrarLeccionIngles(siguiente, r);
        if (siguiente.modo === "legendario" && !r.sinVidas && r.total && r.aciertos / r.total >= 0.9) {
          await api.marcarLegendaria(siguiente.unidad);
          r.legendaria = true;
        }
        if (siguiente.modo === "examen") r.nota = await api.guardarExamen({ aciertos: r.aciertos, total: r.total });
        if (siguiente.modo === "prueba") {
          const registro = await api.guardarPrueba(siguiente.unidad, r.aciertos, r.total);
          r.prueba = { aprobada: r.total > 0 && r.aciertos / r.total >= PRUEBA.aprobar, yaAprobada: pruebaAprobada(registro) };
        }
        // Programación: cómo quedó la unidad y qué lección sigue
        if (ambito === "programacion" && siguiente.unidad) {
          const d = await api.lecciones("programacion");
          const plan = planUnidad(d.items, d.registros, siguiente.unidad, d.reportados);
          const titulo = d.unidades.find((u) => u.id === siguiente.unidad)?.titulo ?? siguiente.unidad;
          r.unidad = { id: siguiente.unidad, titulo, plan, hecha: siguiente.parte ? leccionDe(plan, siguiente.parte) : null, siguiente: (siguiente.parte && despuesDe(plan, siguiente.parte)) || plan.siguiente };
        }
        if (siguiente.modo === "nivel") {
          const nivel = resultadoNivel(siguiente, unidades);
          await api.guardarNivelIngles(nivel.empiezaEn);
          r.nivel = unidades.find((u) => u.id === nivel.empiezaEn) ?? null;
        }
        celebrar(r.perfecta || r.legendaria ? "logro" : "leccion");
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
    else if (item.tipo === "escribir") correcto = escrituraCorrecta(item, escrito);
    else correcto = elegida === item.correcta;
    const casi = correcto === "casi";
    correcto = !!correcto;
    // En inglés, oír la respuesta correcta ayuda a fijarla
    if (item.audioRespuesta || (item.tipo === "armar" && item.audio)) hablar(item.audioRespuesta ?? item.audio);
    (correcto ? feedback.acierto : feedback.fallo)();
    setRetro({ correcto, casi, permitirEquivalente: (item.tipo === "ordenar" || item.tipo === "armar" || item.tipo === "escribir") && !correcto });
  }

  /** Hablar: el componente ya corrigió con el reconocimiento de voz. */
  function alHablar(correcto) {
    (correcto ? feedback.acierto : feedback.fallo)();
    setRetro({ correcto, permitirEquivalente: !correcto });
  }

  const alEmparejar = useCallback(
    (errores) => {
      (errores === 0 ? sonidos.acierto : sonidos.fallo)();
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
          {final.prueba
            ? final.prueba.aprobada
              ? "¡Prueba aprobada!"
              : `Prueba: ${final.aciertos} de ${final.total}`
            : final.nota !== undefined
            ? `Nota: ${final.nota}/20`
            : final.nivel !== undefined
              ? "¡Prueba terminada!"
              : final.sinVidas
                ? "Te quedaste sin vidas"
                : final.legendaria
                  ? "¡Unidad legendaria!"
                  : final.perfecta
                    ? "¡Lección perfecta!"
                    : "¡Lección completa!"}
        </motion.div>
        {ambito === "ingles" && (
          <Bit
            animo={final.sinVidas ? "triste" : "fiesta"}
            tamano={72}
            dice={
              final.sinVidas
                ? "No pasa nada: lo que respondiste ya cuenta. Repasa tus errores y vuelve."
                : final.legendaria
                  ? "La dominas de verdad. Ahora es dorada."
                  : final.perfecta
                    ? `Cero errores. +${10} XP extra.`
                    : final.comboMax >= 5
                      ? `Tu mejor combo: ${final.comboMax} seguidas.`
                      : "Un día más. Así se aprende un idioma."
            }
          />
        )}
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
        {ambito === "ingles" && final.fallados.length > 0 && (
          <div className={estilos.falladas}>
            <span>Para repasar</span>
            <ul>
              {final.fallados.slice(0, 5).map((p) => (
                <li key={p.clave}>
                  <div>
                    <strong lang="en">{p.item?.en ?? textoCorto(p.item?.pregunta)}</strong>
                    {p.item?.es && <small>{p.item.es}</small>}
                  </div>
                  {p.item?.en && <BotonAudio texto={p.item.en} />}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="boton"
              onClick={() => navegar(`/leccion?ambito=ingles&claves=${encodeURIComponent(final.fallados.map((p) => p.clave).join(","))}`)}
            >
              <IconoRepetir tamano={16} /> Repasar {final.fallados.length === 1 ? "esta" : `estas ${final.fallados.length}`} ahora
            </button>
          </div>
        )}
        {final.prueba && (
          <p className={estilos.nivel}>
            {final.prueba.aprobada
              ? "Aprobaste la unidad: queda marcada en Lecciones."
              : `Necesitas ${Math.ceil(PRUEBA.aprobar * final.total)} de ${final.total} para aprobarla.${final.prueba.yaAprobada ? " Igual ya la tenías aprobada de antes." : " Repasa lo que fallaste y vuelve a intentarlo."}`}
          </p>
        )}
        {final.unidad && <AvanceUnidad unidad={final.unidad} />}
        {ambito !== "ingles" && final.fallados.length > 0 && (
          <div className={estilos.repasar}>
            <span>Para repasar</span>
            {final.fallados.map((p, i) => {
              const enlace = enlaceFuente(p.item?.fuente);
              const repetido = final.fallados.slice(0, i).some((q) => enlaceFuente(q.item?.fuente) === enlace);
              return enlace && !repetido ? (
                <Link key={p.clave} to={enlace}>
                  {p.item.fuente.titulo ?? p.clave} →
                </Link>
              ) : null;
            })}
          </div>
        )}
        <div className={estilos.acciones}>
          {final.unidad?.siguiente && sesion.modo !== "prueba" ? (
            <Link to={`/leccion?unidad=${encodeURIComponent(final.unidad.id)}&parte=${final.unidad.siguiente.id}`} className="boton boton-primario">
              Siguiente: {final.unidad.siguiente.nombre}
            </Link>
          ) : (
            <button type="button" className="boton boton-primario" onClick={() => navegar(0)}>
              {sesion.modo === "prueba" ? "Otra prueba" : "Otra lección"}
            </button>
          )}
          {final.unidad?.siguiente && sesion.parte && (
            <button type="button" className="boton" onClick={() => navegar(0)}>
              Repetir esta
            </button>
          )}
          <Link to={inicio} className="boton">
            {ambito === "ingles" ? "Volver a Inglés" : inicio === "/camino" ? "Volver a Lecciones" : "Volver a Hoy"}
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
          : item.tipo === "escribir"
            ? escrito.trim().length > 0
            : false);

  return (
    <div className={estilos.leccion}>
      <header className={estilos.barra}>
        <button type="button" className={estilos.cerrar} onClick={salir} aria-label="Salir de la lección">
          ✕
        </button>
        <div className={estilos.avance} data-combo={(sesion.combo ?? 0) >= 5}>
          <motion.div animate={{ width: `${Math.max(4, progreso * 100)}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
        </div>
        {(sesion.combo ?? 0) >= 3 && (
          <motion.span key={sesion.combo} className={estilos.combo} initial={{ scale: 1.4 }} animate={{ scale: 1 }} title="Aciertos seguidos">
            <IconoLlamita tamano={16} /> {sesion.combo}
          </motion.span>
        )}
        {sesion.vidas !== null && sesion.vidas !== undefined && (
          <span className={estilos.vidas} title="Vidas">
            <IconoCorazon tamano={16} /> {sesion.vidas}
          </span>
        )}
      </header>
      <AnimatePresence>
        {hito && (
          <motion.div className={estilos.hito} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}>
            <IconoLlamita tamano={22} /> ¡{hito} seguidas!
          </motion.div>
        )}
      </AnimatePresence>

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
            {sesion.fallados.includes(sesion.cola[sesion.posicion]) && (
              <span className={estilos.denuevo} title="La fallaste hace un momento: vuelve al final de la lección para que la fijes">
                Otra vez: la fallaste hace un momento
              </span>
            )}
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
          {paso.tipo === "escribir" && <ItemEscribir item={item} valor={escrito} alCambiar={setEscrito} alEnviar={comprobar} bloqueado={!!retro} />}
          {paso.tipo === "hablar" && <ItemHablar item={item} alResultado={alHablar} alSaltar={() => avanzar({ saltar: true })} bloqueado={!!retro} />}
        </motion.main>
      </AnimatePresence>

      {/* Pie: Comprobar, o la hoja con el resultado */}
      {item && !retro && paso.tipo !== "emparejar" && paso.tipo !== "tarjeta" && paso.tipo !== "hablar" && (
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
            {ambito === "ingles" ? (
              <Bit
                animo={retro.correcto ? "feliz" : "triste"}
                tamano={44}
                dice={
                  retro.casi
                    ? "¡Bien! Ojo con la ortografía: compárala abajo."
                    : retro.correcto
                      ? (sesion.combo ?? 0) >= 5
                        ? fraseDeBit("combo", sesion.posicion)
                        : fraseDeBit("acierto", sesion.posicion)
                      : paso.tipo === "emparejar"
                        ? `Con ${retro.errores} ${retro.errores === 1 ? "error" : "errores"}`
                        : fraseDeBit("fallo", sesion.posicion)
                }
              />
            ) : (
              <strong className={estilos.veredicto}>
                {retro.correcto ? "¡Bien!" : paso.tipo === "emparejar" ? `Con ${retro.errores} ${retro.errores === 1 ? "error" : "errores"}` : "No es así"}
              </strong>
            )}
            {!retro.correcto && item.tipo === "ordenar" && (
              <div className={estilos.correcta}>
                <span>Orden correcto</span>
                <Markdown>{"```" + (item.lenguaje ?? "js") + "\n" + item.lineas.join("\n") + "\n```"}</Markdown>
              </div>
            )}
            {(!retro.correcto || retro.casi) && (item.tipo === "escribir" || item.tipo === "hablar") && (
              <div className={estilos.correcta}>
                <span>{item.tipo === "hablar" ? "La frase" : "Respuesta correcta"}</span>
                <p>{item.respuesta ?? item.texto}</p>
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
                  {item.tipo === "hablar" ? "Sí lo dije bien" : item.tipo === "armar" || item.tipo === "escribir" ? "Mi frase también es correcta" : "Mi orden también vale"}
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
