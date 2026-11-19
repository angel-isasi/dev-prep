// Lecciones de programación (/camino). Cada unidad se divide en lecciones cortas con nombre (plan.js),
// agrupadas en Lo esencial, Con código real y Métodos a fondo. Arriba (o a la derecha en pantallas
// grandes) "Sigue aquí" te deja en la siguiente lección que toca, el repaso del día y cómo se mide el
// avance. Nada se bloquea: el orden solo se sugiere.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../../lib/api.js";
import { almacen } from "../../lib/visita.js";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { Pestanas } from "../../components/Pestanas.jsx";
import { terminada } from "./motor.js";
import { clavePrueba, planUnidad, PRUEBA, pruebaAprobada } from "./plan.js";
import estilos from "./RutaLecciones.module.css";

const AREAS = { javascript: "JavaScript", algoritmos: "Algoritmos", react: "React", typescript: "TypeScript", node: "Node y SQL" };
const ESTADOS = { nueva: "Sin empezar", empezada: "En curso", completa: "Completa", dominada: "Dominada" };
/** Lecciones que se ven de cada grupo antes de "Ver todas". */
const VISIBLES = 6;

/**
 * Los nombres de lección juntan varios títulos ("A · B y 2 más") y se cortaban en la tarjeta.
 * Aquí se muestra solo el primero y cuántos más trae: "A +3". El nombre completo queda en el title.
 */
export function nombreCorto(nombre = "") {
  const partes = nombre.split(" · ");
  if (partes.length === 1) return nombre;
  const resto = partes.at(-1).match(/ y (\d+) más$/); // "B y 2 más": B cuenta 1 y además vienen 2
  const extra = partes.length - 1 + (resto ? Number(resto[1]) : 0);
  return `${partes[0]} +${extra}`;
}

/** La unidad de la que sale "Sigue aquí": la tuya o, si ya la terminaste, la próxima sin completar. */
function unidadQueSigue(datos, planes, actual) {
  return planes.get(actual?.id)?.siguiente ? actual : datos.unidades.find((u) => !planes.get(u.id).completa && planes.get(u.id).siguiente);
}

const enlaceParte = (unidad, parte) => `/leccion?unidad=${encodeURIComponent(unidad)}&parte=${parte}`;

/** Conceptos de la teoría que marcaste como leídos (los guarda TeoriaTema en este navegador). */
function leidosDe(id) {
  try {
    return (JSON.parse(almacen.getItem("devprep.teoriaLeidos")) ?? {})[id]?.length ?? 0;
  } catch {
    return 0;
  }
}

export function RutaLecciones() {
  const [datos, setDatos] = useState(null);
  const [area, setArea] = useState(null);
  const [abierta, setAbierta] = useState(undefined); // undefined: la unidad actual
  const cargar = () => api.lecciones("programacion").then(setDatos);
  useEffect(() => {
    cargar();
  }, []);

  // El plan de cada unidad (lecciones, avance y la siguiente que toca)
  const planes = useMemo(() => {
    if (!datos) return new Map();
    return new Map(datos.unidades.map((u) => [u.id, planUnidad(datos.items, datos.registros, u.id, datos.reportados)]));
  }, [datos]);

  if (!datos) return <Esqueleto variante="lista" />;

  const actual = datos.unidades.find((u) => u.id === datos.unidadActual) ?? datos.unidades[0];
  const areaActiva = area ?? actual?.area ?? "javascript";
  const unidadAbierta = abierta === undefined ? actual?.id : abierta;
  const areas = Object.entries(AREAS)
    .map(([id, titulo]) => ({ id, titulo, unidades: datos.unidades.filter((u) => u.area === id) }))
    .filter((a) => a.unidades.length);
  const delArea = areas.find((a) => a.id === areaActiva)?.unidades ?? [];
  const completas = (lista) => lista.filter((u) => planes.get(u.id)?.completa).length;
  const leccionesHechas = [...planes.values()].reduce((t, p) => t + p.hechas, 0);
  // Si "Sigue aquí" ya ofrece la siguiente lección de una unidad, esa unidad no repite el botón
  const hayAMedias = datos.enCurso && !terminada(datos.enCurso);
  const idSigue = hayAMedias ? null : unidadQueSigue(datos, planes, actual)?.id;

  async function hacerActual(id) {
    await api.elegirUnidad(id);
    await cargar();
  }

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta={`${datos.lecciones?.xp ?? 0} XP · ${leccionesHechas} lecciones hechas`} titulo="Lecciones">
        Cada unidad se divide en lecciones de unos 3 minutos. Termina las de Lo esencial y Con código real para completarla, y luego aprueba su prueba.
      </CabeceraPagina>

      <div className={estilos.cuerpo}>
        <div className={estilos.lado}>
          <SigueAqui datos={datos} planes={planes} actual={actual} />
          <Repaso datos={datos} />
          <ComoSeMide />
        </div>

        <div className={estilos.principal} data-area={areaActiva}>
          <PestanasArea activa={areaActiva}>
            <Pestanas
              pestanas={areas.map((a) => ({ id: a.id, texto: a.titulo, extra: `${completas(a.unidades)}/${a.unidades.length}` }))}
              activa={areaActiva}
              alCambiar={(id) => {
                setArea(id);
                setAbierta(null);
              }}
            />
          </PestanasArea>
          <p className={estilos.resumenArea}>
            {completas(delArea)}/{delArea.length} unidades · {delArea.reduce((t, u) => t + planes.get(u.id).hechas, 0)}/
            {delArea.reduce((t, u) => t + planes.get(u.id).total, 0)} lecciones
          </p>

          <ol className={estilos.ruta}>
            {delArea.map((u, i) => (
              <Unidad
                key={u.id}
                unidad={u}
                numero={u.orden ?? i + 1}
                plan={planes.get(u.id)}
                actual={u.id === actual?.id}
                abierta={unidadAbierta === u.id}
                alAbrir={() => setAbierta(unidadAbierta === u.id ? null : u.id)}
                alHacerActual={() => hacerActual(u.id)}
                enSigueAqui={u.id === idSigue}
                teoria={datos.teoria?.[u.id] ?? 0}
                prueba={datos.quizzes?.[clavePrueba(u.id)]}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Las pestañas de área no entran todas en el celular: la fila se desliza hacia los lados (ninguna se
 * corta a la mitad sin poder verla) y, al cambiar de área, la pestaña activa se trae a la vista.
 */
function PestanasArea({ activa, children }) {
  const caja = useRef(null);
  useEffect(() => {
    caja.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activa]);
  return (
    <div className={estilos.pestanas} ref={caja}>
      {children}
    </div>
  );
}

/** La siguiente lección que toca: de tu unidad o, si ya la terminaste, de la próxima sin completar. */
function SigueAqui({ datos, planes, actual }) {
  const enCurso = datos.enCurso && !terminada(datos.enCurso) ? datos.enCurso : null;
  const unidad = unidadQueSigue(datos, planes, actual);
  const plan = unidad ? planes.get(unidad.id) : null;
  const leccion = plan?.siguiente;
  const requeridas = plan ? plan.grupos.filter((g) => !g.opcional).flatMap((g) => g.lecciones) : [];

  return (
    <article className={`${estilos.caja} ${estilos.sigue}`} data-area={unidad?.area}>
      <span className={estilos.etiqueta}>Sigue aquí</span>
      {enCurso ? (
        <>
          <strong className={estilos.sigueTitulo}>Tienes una lección a medias</strong>
          <Link to="/leccion?retomar=1" className={`boton boton-primario ${estilos.grande}`}>
            Continuar la lección
          </Link>
        </>
      ) : leccion ? (
        <>
          <small className={estilos.suave}>
            {AREAS[unidad.area] ?? unidad.area} · {unidad.titulo}
          </small>
          <strong className={estilos.sigueTitulo} title={leccion.nombre}>
            {nombreCorto(leccion.nombre)}
          </strong>
          <p className={estilos.suave}>
            {leccion.vistos > 0 ? `${leccion.vistos}/${leccion.preguntas}` : `${leccion.preguntas} preguntas`} · {leccion.minutos} min
          </p>
          {requeridas.length > 0 && (
            <div className={estilos.segmentos} aria-label={`${plan.hechas} de ${plan.total} lecciones de la unidad`}>
              {requeridas.map((l) => (
                <i key={l.id} data-estado={l.hecha ? "hecha" : l.vistos ? "empezada" : "nueva"} data-esta={l.id === leccion.id} />
              ))}
            </div>
          )}
          <Link to={enlaceParte(unidad.id, leccion.id)} className={`boton boton-primario ${estilos.grande}`} onClick={() => api.elegirUnidad(unidad.id)}>
            Empezar
          </Link>
        </>
      ) : (
        <>
          <strong className={estilos.sigueTitulo}>Completaste todas las unidades</strong>
          <p className={estilos.suave}>Ahora fíjalo: repaso del día y pruebas de unidad.</p>
        </>
      )}
    </article>
  );
}

/** Lo que toca repasar hoy (repaso espaciado) y tus errores. */
function Repaso({ datos }) {
  const validos = datos.items.filter((it) => !datos.reportados?.[it.clave]);
  const vencidos = validos.filter((it) => datos.registros[it.clave]?.proximo && datos.registros[it.clave].proximo <= datos.hoy).length;
  const errores = validos.filter((it) => datos.registros[it.clave]?.ultima === "no").length;
  return (
    <article className={`${estilos.caja} ${estilos.repaso}`}>
      <span className={estilos.etiqueta}>Repaso</span>
      <div className={estilos.cifras}>
        <div>
          <strong>{vencidos}</strong>
          <span>para repasar hoy</span>
        </div>
        <div data-tipo="error">
          <strong>{errores}</strong>
          <span>{errores === 1 ? "error por corregir" : "errores por corregir"}</span>
        </div>
      </div>
      <div className={estilos.botones}>
        <Link to="/leccion" className="boton">
          Repaso del día
        </Link>
        {errores > 0 && (
          <Link to="/leccion?modo=errores" className="boton">
            Corregir errores
          </Link>
        )}
        <Link to="/leccion?modo=rapida" className="boton boton-fantasma">
          Rápida: 5 preguntas
        </Link>
      </div>
    </article>
  );
}

function ComoSeMide() {
  return (
    <details className={`${estilos.caja} ${estilos.mide}`}>
      <summary>Cómo se mide tu avance</summary>
      <dl>
        <div>
          <dt>Grupos de lecciones</dt>
          <dd>
            Lo esencial: las ideas del tema, su vocabulario y predecir qué hace el código. Con código real: completar, ordenar y encontrar
            errores en código de los ejercicios. Métodos a fondo es opcional: no hace falta para completar la unidad.
          </dd>
        </div>
        <div>
          <dt>Repaso del día</dt>
          <dd>Mezcla lo que toca recordar con algo nuevo de tu unidad y preguntas de entrevista.</dd>
        </div>
        <div>
          <dt>Lección hecha</dt>
          <dd>Respondiste todas sus preguntas al menos una vez. Se marca apenas la terminas.</dd>
        </div>
        <div>
          <dt>Aprendida</dt>
          <dd>La última vez que salió, la acertaste.</dd>
        </div>
        <div>
          <dt>Fijada</dt>
          <dd>La recordaste en repasos de días distintos. Una unidad está dominada con el 80% fijado.</dd>
        </div>
        <div>
          <dt>"Otra vez"</dt>
          <dd>Si fallas una pregunta, vuelve al final de la misma lección. Días después vuelve en el repaso hasta que la fijes.</dd>
        </div>
        <div>
          <dt>Prueba de la unidad</dt>
          <dd>
            {PRUEBA.preguntas} preguntas al azar de toda la unidad, sin segunda oportunidad. Se aprueba con el {Math.round(PRUEBA.aprobar * 100)}%.
          </dd>
        </div>
      </dl>
    </details>
  );
}

function Unidad({ unidad, numero, plan, actual, abierta, alAbrir, alHacerActual, enSigueAqui, teoria, prueba }) {
  const requeridas = plan.grupos.filter((g) => !g.opcional).flatMap((g) => g.lecciones);
  const aprobada = pruebaAprobada(prueba);
  return (
    <li className={estilos.unidad} data-estado={plan.estado} data-actual={actual}>
      <span className={estilos.marca} aria-hidden>
        {plan.completa ? "✓" : String(numero).padStart(2, "0")}
      </span>
      <article className={estilos.tarjeta} data-abierta={abierta}>
        <button type="button" className={estilos.cabeza} onClick={alAbrir} aria-expanded={abierta}>
          <span className={estilos.tituloFila}>
            <strong>{unidad.titulo}</strong>
            <span className={estilos.chip} data-estado={plan.estado}>
              {ESTADOS[plan.estado]}
            </span>
            {aprobada && <span className={estilos.chip} data-estado="aprobada">Prueba aprobada</span>}
            {actual && <span className={estilos.chip} data-estado="actual">Tu unidad</span>}
          </span>
          <span className={estilos.segmentos} aria-hidden>
            {requeridas.map((l) => (
              <i key={l.id} data-estado={l.hecha ? "hecha" : l.vistos ? "empezada" : "nueva"} />
            ))}
          </span>
          {/* Cerrada: solo lo justo. El detalle (aprendidas, fijadas, métodos) sale al abrirla. */}
          <span className={estilos.datos}>
            <span>
              <strong>
                {plan.hechas}/{plan.total}
              </strong>{" "}
              lecciones
            </span>
            <span title="Preguntas aprendidas">
              <strong>
                {plan.preguntas.aprendidos}/{plan.preguntas.total}
              </strong>
            </span>
          </span>
          <span className={estilos.flecha} aria-hidden>
            ›
          </span>
        </button>

        <AnimatePresence initial={false}>
          {abierta && (
            <motion.div
              className={estilos.detalle}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className={estilos.detalleDatos}>
                {plan.preguntas.aprendidos} de {plan.preguntas.total} preguntas aprendidas · {plan.preguntas.fijados} fijadas
                {plan.opcionales.total > 0 ? ` · Métodos: ${plan.opcionales.hechas} de ${plan.opcionales.total}` : ""}
              </p>
              <div className={estilos.accionesUnidad}>
                {/* Si "Sigue aquí" ya lleva a esta misma lección, el botón sería un duplicado */}
                {plan.siguiente && !enSigueAqui && (
                  <Link
                    to={enlaceParte(unidad.id, plan.siguiente.id)}
                    className="boton boton-primario"
                    title={plan.siguiente.nombre}
                    onClick={() => api.elegirUnidad(unidad.id)}
                  >
                    {plan.siguiente.vistos ? "Seguir" : "Empezar"}
                  </Link>
                )}
                {unidad.conTeoria && (
                  <Link to={`/aprender/${unidad.id}`} className="boton">
                    Teoría{teoria ? ` · ${Math.min(leidosDe(unidad.id), teoria)} de ${teoria} leídos` : ""}
                  </Link>
                )}
                {unidad.conTeoria && (
                  <Link to={`/leccion?unidad=${encodeURIComponent(unidad.id)}&modo=quiz`} className="boton">
                    Quiz relámpago
                  </Link>
                )}
                <Link
                  to={`/leccion?unidad=${encodeURIComponent(unidad.id)}&modo=prueba`}
                  className={`boton ${plan.completa && !aprobada ? "boton-primario" : ""}`}
                  title={plan.completa ? "" : "Puedes hacerla cuando quieras, pero rinde más con la unidad completa"}
                >
                  Prueba de la unidad{prueba ? ` · mejor ${prueba.mejor}/${prueba.total}` : ""}
                </Link>
                {!actual && (
                  <button type="button" className="boton boton-fantasma" onClick={alHacerActual}>
                    Marcar como mi unidad
                  </button>
                )}
              </div>

              <div className={estilos.grupos}>
                {plan.grupos.map((g) => (
                  <Grupo key={g.id} grupo={g} unidad={unidad.id} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </li>
  );
}

/** Un grupo de lecciones de una unidad ("Lo esencial", "Con código real"...). También lo usa la página del tema. */
export function Grupo({ grupo, unidad }) {
  const [todas, setTodas] = useState(false);
  const visibles = todas ? grupo.lecciones : grupo.lecciones.slice(0, VISIBLES);
  return (
    <section className={estilos.grupo} data-opcional={grupo.opcional}>
      <header>
        {/* La descripción del grupo ya no ocupa una línea: queda como title y en "Cómo se mide tu avance" */}
        <h3 title={grupo.texto}>{grupo.titulo}</h3>
        <span>
          {grupo.hechas}/{grupo.lecciones.length}
        </span>
      </header>
      <ol className={estilos.lecciones}>
        {visibles.map((l) => {
          const estado = l.hecha ? "hecha" : l.vistos ? "empezada" : "nueva";
          return (
            <li key={l.id}>
              <Link to={enlaceParte(unidad, l.id)} className={estilos.leccion} data-estado={estado} onClick={() => api.elegirUnidad(unidad)}>
                <span className={estilos.icono} aria-hidden>
                  {l.hecha ? "✓" : l.numero}
                </span>
                <span className={estilos.leccionTexto}>
                  <strong title={l.nombre}>{nombreCorto(l.nombre)}</strong>
                  <small>
                    {estado === "empezada" ? `${l.vistos}/${l.preguntas}` : `${l.preguntas} preguntas`} · {l.minutos} min
                    {l.errores ? ` · ${l.errores} por corregir` : ""}
                  </small>
                </span>
                <span className={estilos.miniBarra} aria-hidden>
                  <i style={{ width: `${(l.vistos / Math.max(1, l.total)) * 100}%` }} />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {grupo.lecciones.length > VISIBLES && (
        <button type="button" className={estilos.verTodas} onClick={() => setTodas((t) => !t)}>
          {todas ? "Ver menos" : `Ver las ${grupo.lecciones.length}`}
        </button>
      )}
    </section>
  );
}
