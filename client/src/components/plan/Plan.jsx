// Plan junior en pantalla (el cálculo está en server/plan-junior.js y los datos en lib/plan-junior.js):
// - PlanHoy: el bloque de la pantalla Hoy (día, lo que toca y el mentor).
// - PlanCompleto: la página /plan con el calendario, las etapas y el temario.
// - Mentor: la IA que mira tu plan y te dice qué hacer; MentorPaso comenta un ejercicio recién resuelto.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { claveIa, estadoIa } from "../../lib/ia.js";
import { almacen } from "../../lib/visita.js";
import { useEvento } from "../../hooks/useEvento.js";
import { cargarPlan, empezarPlan, hayPlan, quitarPlan } from "../../lib/plan-junior.js";
import { DIAS_PLAN, duracion, PARA_CRECER, sumarDias, textoEstado } from "../../../../server/plan-junior.js";
import { useIa } from "../ia/useIa.js";
import { IconoAprender, IconoCandado, IconoChispa, IconoEntrevistas, IconoFlechaDer, IconoLecciones, IconoMicrofono, IconoPracticar, IconoRepetir, IconoTrofeo } from "../Iconos.jsx";
import estilos from "./Plan.module.css";

const ICONOS = { teoria: IconoAprender, lecciones: IconoLecciones, ejercicio: IconoPracticar, pregunta: IconoEntrevistas, control: IconoTrofeo, repaso: IconoRepetir, simulacro: IconoMicrofono };
const TONO = { "al-dia": "exito", adelantado: "exito", atrasado: "aviso", vencido: "error", "por-empezar": "acento" };
const NOMBRE_ETAPA = { javascript: "JavaScript", react: "React", repaso: "Repaso", simulacro: "Simulacro" };
const DIAS_SEMANA = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const diaCorto = (fecha) => `${DIAS_SEMANA[new Date(`${fecha}T12:00:00`).getDay()]} ${Number(fecha.slice(8))}`;

/** Carga el plan y lo vuelve a cargar cuando resuelves algo o vuelves a la pestaña. */
export function usePlan() {
  const [plan, setPlan] = useState(undefined); // undefined: cargando · null: esta versión no tiene plan
  const cargar = () => {
    if (!hayPlan()) return setPlan(null);
    cargarPlan().then(setPlan, () => setPlan(null));
  };
  useEffect(() => {
    cargar();
    const alVolver = () => document.visibilityState === "visible" && cargar();
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEvento("resultado", (d) => {
    if (d.resueltoAhora || d.repasoCompletado) cargar();
  });
  return [plan, cargar];
}

// ---------- Piezas ----------

function Estado({ estado }) {
  return (
    <span className="chip" data-tono={TONO[estado.tipo]}>
      {textoEstado(estado)}
    </span>
  );
}

/** Una tarea como fila: icono, título y un dato. */
function Tarea({ tarea, conTema = true }) {
  const Icono = ICONOS[tarea.tipo] ?? IconoChispa;
  const parcial = !tarea.hecha && tarea.avance > 0;
  return (
    <Link to={tarea.destino} className={estilos.tarea} data-hecha={tarea.hecha}>
      <span className={estilos.tareaIcono} aria-hidden>
        {tarea.hecha ? "✓" : <Icono tamano={15} />}
      </span>
      <span className={estilos.tareaTexto}>
        <strong>{tarea.titulo}</strong>
        <small>
          {conTema ? `${tarea.temaTitulo} · ` : ""}
          {parcial ? `${Math.round(tarea.avance * 100)}% · ` : ""}
          {duracion(tarea.minutos)}
        </small>
      </span>
    </Link>
  );
}

/** La tira de días: uno por ficha, con hoy resaltado. */
function TiraDias({ plan, compacta = false }) {
  return (
    <ol className={estilos.tira} data-compacta={compacta} aria-label="Los días del plan">
      {plan.calendario.map((d) => (
        <li key={d.dia} data-tipo={d.tipo} data-cubierto={d.cubierto} data-etapa={d.etapa} title={`Día ${d.dia} · ${diaCorto(d.fecha)} · ${NOMBRE_ETAPA[d.etapa] ?? ""}${d.tipo !== "pasado" ? ` · ${duracion(d.minutos)}` : d.cubierto ? " · cubierto" : " · quedó pendiente"}`}>
          {compacta ? (
            <i />
          ) : (
            <>
              <b>{d.tipo === "pasado" && d.cubierto ? "✓" : d.dia}</b>
              <span>{diaCorto(d.fecha)}</span>
              <small>{NOMBRE_ETAPA[d.etapa] ?? ""}</small>
              <em>{d.tipo === "pasado" ? (d.cubierto ? "cubierto" : "pendiente") : duracion(d.minutos)}</em>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Tarjeta para empezar: qué incluye el plan y dos botones. */
function Empezar({ plan, alCambiar, hoy }) {
  const [ocupado, setOcupado] = useState(false);
  const empezar = async (inicio) => {
    setOcupado(true);
    await empezarPlan(inicio, DIAS_PLAN);
    alCambiar();
  };
  const r = plan.resumen;
  return (
    <section className={`tarjeta-protagonista ${estilos.empezar}`}>
      <div>
        <span className="etiqueta">Plan junior</span>
        <h2>Lo necesario para una entrevista junior, en {DIAS_PLAN} días</h2>
        <p>Solo JavaScript y React, lo que de verdad preguntan. La app reparte todo por día y un mentor con IA te sigue paso a paso.</p>
      </div>
      <dl className={estilos.cifras}>
        <div>
          <dd>{r.temas}</dd>
          <dt>temas</dt>
        </div>
        <div>
          <dd>{r.ejercicios}</dd>
          <dt>ejercicios</dt>
        </div>
        <div>
          <dd>{r.preguntas}</dd>
          <dt>preguntas de entrevista</dt>
        </div>
        <div>
          <dd>{Math.round(r.minutos / 60)} h</dd>
          <dt>de estudio estimado</dt>
        </div>
      </dl>
      <div className={estilos.empezarAcciones}>
        <button type="button" className="boton boton-primario" disabled={ocupado} onClick={() => empezar(hoy)}>
          Empezar hoy
        </button>
        <button type="button" className="boton" disabled={ocupado} onClick={() => empezar(sumarDias(hoy, 1))}>
          Empezar mañana
        </button>
        <Link to="/plan">Ver qué incluye</Link>
      </div>
    </section>
  );
}

// ---------- Mentor ----------
const CLAVE_MENTOR = "devprep.mentor";
const leerMentor = () => {
  try {
    return JSON.parse(almacen.getItem(CLAVE_MENTOR) ?? "null");
  } catch {
    return null;
  }
};
const guardarMentor = (valor) => {
  try {
    almacen.setItem(CLAVE_MENTOR, JSON.stringify(valor));
  } catch {
    // sin espacio: el mensaje se pide otra vez la próxima
  }
};

/** ¿La IA está configurada y tienes tu contraseña puesta en este navegador? */
function useIaLista() {
  const [lista, setLista] = useState(null);
  useEffect(() => {
    if (!claveIa()) return setLista(false);
    estadoIa().then((e) => setLista(!!e.configurada));
  }, []);
  return lista;
}

function Pasos({ pasos, plan }) {
  if (!pasos?.length) return null;
  return (
    <ol className={estilos.pasos}>
      {pasos.slice(0, 3).map((p, i) => {
        const destino = plan?.tareas?.find((t) => t.clave === p.tarea)?.destino;
        const cuerpo = (
          <>
            <b>{i + 1}</b>
            <span>{p.texto}</span>
            {destino && <IconoFlechaDer tamano={14} />}
          </>
        );
        return <li key={i}>{destino ? <Link to={destino}>{cuerpo}</Link> : <div>{cuerpo}</div>}</li>;
      })}
    </ol>
  );
}

/**
 * El mentor: una vez al día mira tu plan y te dice cómo vas; después puedes preguntarle lo que sea.
 * @param {{ plan: object, compacto?: boolean }} props
 */
export function Mentor({ plan, compacto = false }) {
  const lista = useIaLista();
  const { cargando, error, pedir } = useIa();
  const [guardado, setGuardado] = useState(leerMentor);
  const [texto, setTexto] = useState("");
  const pidiendo = useRef(false);
  const hoy = plan.hoyFecha;
  const delDia = guardado?.fecha === hoy ? guardado : null;

  async function consultar(pregunta = "") {
    if (pidiendo.current) return;
    pidiendo.current = true;
    const charla = delDia?.charla ?? [];
    const r = await pedir({ tarea: "mentor", datos: plan.texto, ...(pregunta ? { pregunta, historial: charla.slice(-8) } : {}) });
    pidiendo.current = false;
    if (!r) return;
    const nuevo = { fecha: hoy, r, charla: pregunta ? [...charla, { de: "yo", texto: pregunta }, { de: "mentor", texto: r.mensaje }].slice(-12) : charla };
    guardarMentor(nuevo);
    setGuardado(nuevo);
  }

  // Una vez al día, solo, apenas hay plan e IA
  useEffect(() => {
    if (lista && plan.dia >= 1 && !delDia) consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, hoy]);

  function enviar(evento) {
    evento.preventDefault();
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;
    setTexto("");
    consultar(pregunta);
  }

  if (lista === false) {
    return (
      <section className={`tarjeta ${estilos.mentor}`} data-compacto={compacto}>
        <span className="etiqueta">Tu mentor</span>
        <strong className={estilos.titular}>Tu mentor usa la IA</strong>
        <p className={estilos.mensaje}>Pon tu contraseña de IA en Ajustes y te dirá cada día cómo vas y qué hacer.</p>
        <Link to="/ajustes" className="boton">
          Ir a Ajustes
        </Link>
      </section>
    );
  }

  const r = delDia?.r;
  const ultimaPregunta = delDia?.charla?.findLast?.((c) => c.de === "yo")?.texto;
  return (
    <section className={`tarjeta ${estilos.mentor}`} data-compacto={compacto}>
      <header>
        <span className="etiqueta">Tu mentor</span>
        {r && (
          <button type="button" className={estilos.enlace} disabled={cargando} onClick={() => consultar()}>
            Actualizar
          </button>
        )}
      </header>
      {!r && <p className={estilos.mensaje}>{cargando || lista === null ? "Mirando tu plan..." : (error ?? "Todavía no hay mensaje de hoy.")}</p>}
      {r && (
        <>
          {ultimaPregunta && <p className={estilos.pregunta}>{ultimaPregunta}</p>}
          <strong className={estilos.titular}>{r.titular}</strong>
          <p className={estilos.mensaje}>{r.mensaje}</p>
          {r.alerta && (
            <p className={estilos.alerta}>
              <span className="chip" data-tono="aviso">
                Ojo
              </span>
              {r.alerta}
            </p>
          )}
          <Pasos pasos={r.pasos} plan={plan} />
        </>
      )}
      {error && r && <p className={estilos.error}>{error}</p>}
      <form className={estilos.preguntar} onSubmit={enviar}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Pregúntale lo que sea" aria-label="Pregunta para tu mentor" maxLength={600} />
        <button type="submit" className="boton" disabled={!texto.trim() || cargando}>
          {cargando ? "..." : "Preguntar"}
        </button>
      </form>
    </section>
  );
}

const CLAVE_PASOS = "devprep.mentorPasos";
/**
 * El mentor comenta un ejercicio que acabas de resolver (solo con el plan activo, una vez por ejercicio).
 * @param {{ ejercicio: object }} props
 */
export function MentorPaso({ ejercicio }) {
  const lista = useIaLista();
  const { cargando, pedir } = useIa();
  const [dato, setDato] = useState(null); // { r, plan }
  const pedido = useRef(false);

  useEffect(() => {
    if (!lista || pedido.current) return;
    pedido.current = true;
    let vivo = true;
    (async () => {
      const plan = await cargarPlan().catch(() => null);
      if (!plan?.activo || !vivo) return;
      let vistos = {};
      try {
        vistos = JSON.parse(almacen.getItem(CLAVE_PASOS) ?? "{}") ?? {};
      } catch {
        vistos = {};
      }
      if (vistos[ejercicio.id]) return setDato({ r: vistos[ejercicio.id], plan });
      const p = ejercicio.progreso ?? {};
      const minutos = Math.round((p.segundosActivos ?? 0) / 60);
      const hecho = [
        `Acaba de resolver el ejercicio "${ejercicio.titulo}" (nivel ${ejercicio.nivel} de 3; 1 es básico).`,
        `Intentos: ${p.intentos ?? 0}.${minutos ? ` Tiempo de trabajo: ${minutos} min.` : ""} Pistas vistas: ${ejercicio.pistas?.length ?? 0} de ${ejercicio.totalPistas ?? 0}.${p.vioSolucion ? " Vio la solución antes de resolverlo." : " No vio la solución."}`,
        plan.tareas.some((t) => t.clave === `ej:${ejercicio.id}`) ? "Es un ejercicio de su plan." : "Este ejercicio NO es de su plan (es de lo que queda para después).",
      ].join("\n");
      const r = await pedir({ tarea: "mentor", datos: plan.texto, hecho });
      if (!r || !vivo) return;
      try {
        almacen.setItem(CLAVE_PASOS, JSON.stringify(Object.fromEntries([...Object.entries(vistos).slice(-40), [ejercicio.id, r]])));
      } catch {
        // sin espacio: no pasa nada
      }
      // Lo último que dijo queda también como su mensaje del día
      const anterior = leerMentor();
      guardarMentor({ fecha: plan.hoyFecha, r, charla: anterior?.fecha === plan.hoyFecha ? anterior.charla : [] });
      setDato({ r, plan });
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, ejercicio.id]);

  if (!dato && !cargando) return null;
  return (
    <section className={`tarjeta ${estilos.mentor} ${estilos.mentorPaso}`}>
      <span className="etiqueta">Tu mentor</span>
      {!dato ? (
        <p className={estilos.mensaje}>Mirando cómo te fue...</p>
      ) : (
        <>
          <strong className={estilos.titular}>{dato.r.titular}</strong>
          <p className={estilos.mensaje}>{dato.r.mensaje}</p>
          <Pasos pasos={dato.r.pasos} plan={dato.plan} />
        </>
      )}
    </section>
  );
}

// ---------- Bloque de la pantalla Hoy ----------

/** @param {{ plan: object, recargar: () => void }} props el plan ya cargado con usePlan (Hoy decide dónde va el bloque) */
export function PlanHoy({ plan, recargar }) {
  const [hoy, setHoy] = useState(null);
  useEffect(() => {
    if (plan && !plan.activo) api.lecciones("programacion").then((d) => setHoy(d.hoy));
  }, [plan]);
  if (!plan) return null;
  if (!plan.activo) return hoy ? (
    <div className={estilos.enHoy}>
      <Empezar plan={plan} alCambiar={recargar} hoy={hoy} />
    </div>
  ) : null;

  const sigue = plan.siguiente ?? plan.adelanta;
  const visibles = plan.hoy.tareas.filter((t) => !t.hecha).slice(0, 5);
  const hechas = plan.hoy.hechas;
  return (
    <div className={estilos.hoy}>
      <section className={`tarjeta-protagonista ${estilos.dia}`}>
        <header>
          <span className="etiqueta">Plan junior</span>
          <Estado estado={plan.estado} />
        </header>
        <p className={estilos.numero}>
          <strong>{Math.min(Math.max(plan.dia, 0), plan.dias)}</strong>
          <span>
            de {plan.dias} días
            <small>{plan.hoy.total ? `${hechas} de ${plan.hoy.total} tareas hoy` : "Hoy no hay tareas"}</small>
          </span>
        </p>
        <TiraDias plan={plan} compacta />
        <dl className={estilos.cifras}>
          <div>
            <dd>{duracion(plan.hoy.minutos)}</dd>
            <dt>te quedan hoy</dt>
          </div>
          <div>
            <dd>
              {plan.ejercicios.hechos}/{plan.ejercicios.total}
            </dd>
            <dt>ejercicios del plan</dt>
          </div>
        </dl>
        {sigue ? (
          <Link to={sigue.destino} className={`boton boton-primario ${estilos.seguir}`}>
            <span>
              <small>{plan.siguiente ? "Sigue" : "Adelanta"}</small>
              {sigue.titulo}
            </span>
            <IconoFlechaDer />
          </Link>
        ) : (
          <p className={estilos.listo}>Plan terminado. Ya puedes postular.</p>
        )}
      </section>

      <section className={`tarjeta ${estilos.lista}`}>
        <header>
          <span className="etiqueta">Hoy te toca</span>
          <small>{plan.hoy.minutos ? `quedan ${duracion(plan.hoy.minutos)}` : "cumplido"}</small>
        </header>
        {visibles.length > 0 ? (
          <div className={estilos.tareas}>
            {visibles.map((t) => (
              <Tarea key={t.clave} tarea={t} />
            ))}
          </div>
        ) : (
          <p className={estilos.listo}>Terminaste lo de hoy. Si te queda energía, adelanta lo de mañana.</p>
        )}
        <Link to="/plan" className={estilos.verTodo}>
          {plan.hoy.total - hechas > visibles.length ? `Y ${plan.hoy.total - hechas - visibles.length} más. ` : ""}Ver el plan completo →
        </Link>
      </section>

      <Mentor plan={plan} compacto />
    </div>
  );
}

// ---------- Página completa ----------

export function PlanCompleto() {
  const [plan, recargar] = usePlan();
  const [hoy, setHoy] = useState(null);
  const [ajustando, setAjustando] = useState(false);
  useEffect(() => {
    api.lecciones?.("programacion").then((d) => setHoy(d.hoy), () => {});
  }, []);
  if (plan === undefined) return null;
  if (plan === null) return <p className={estilos.listo}>El plan está disponible en la versión web de dev-prep.</p>;
  if (!plan.activo) {
    return (
      <div className={estilos.pagina}>
        {hoy && <Empezar plan={plan} alCambiar={recargar} hoy={hoy} />}
        <Incluye />
      </div>
    );
  }

  // Las tareas de hoy, agrupadas por tema
  const grupos = [];
  for (const t of plan.hoy.tareas) {
    const ultimo = grupos.at(-1);
    if (ultimo?.tema === t.tema) ultimo.tareas.push(t);
    else grupos.push({ tema: t.tema, titulo: t.temaTitulo, tareas: [t] });
  }
  const sigue = plan.siguiente ?? plan.adelanta;
  const cambiar = async (accion) => {
    if (accion === "quitar") await quitarPlan();
    else await empezarPlan(accion.inicio, accion.dias);
    setAjustando(false);
    recargar();
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.arriba}>
        <section className={`tarjeta-protagonista ${estilos.dia} ${estilos.diaGrande}`}>
          <header>
            <span className="etiqueta">
              Del {diaCorto(plan.inicio)} al {diaCorto(plan.fin)}
            </span>
            <Estado estado={plan.estado} />
          </header>
          <p className={estilos.numero}>
            <strong>{Math.min(Math.max(plan.dia, 0), plan.dias)}</strong>
            <span>
              de {plan.dias} días
              <small>{Math.round(plan.total.porcentaje * 100)}% del plan hecho</small>
            </span>
          </p>
          <dl className={estilos.cifras}>
            <div>
              <dd>{duracion(plan.hoy.minutos)}</dd>
              <dt>te quedan hoy</dt>
            </div>
            <div>
              <dd>{duracion(plan.ritmo)}</dd>
              <dt>por día desde hoy</dt>
            </div>
            <div>
              <dd>
                {plan.ejercicios.hechos}/{plan.ejercicios.total}
              </dd>
              <dt>ejercicios</dt>
            </div>
            <div>
              <dd>
                {plan.preguntas.hechos}/{plan.preguntas.total}
              </dd>
              <dt>preguntas</dt>
            </div>
          </dl>
          {sigue && (
            <Link to={sigue.destino} className={`boton boton-primario ${estilos.seguir}`}>
              <span>
                <small>{plan.siguiente ? "Sigue" : "Adelanta"}</small>
                {sigue.titulo}
              </span>
              <IconoFlechaDer />
            </Link>
          )}
        </section>
        <Mentor plan={plan} />
      </div>

      <section className={`tarjeta ${estilos.bloque}`}>
        <header>
          <span className="etiqueta">Tus {plan.dias} días</span>
          <small>Se reacomodan solos según lo que avances</small>
        </header>
        <TiraDias plan={plan} />
      </section>

      <div className={estilos.medio}>
        <section className={`tarjeta ${estilos.bloque}`}>
          <header>
            <span className="etiqueta">Hoy te toca</span>
            <small>
              {plan.hoy.hechas} de {plan.hoy.total} · {plan.hoy.minutos ? `quedan ${duracion(plan.hoy.minutos)}` : "cumplido"}
            </small>
          </header>
          {grupos.length === 0 && <p className={estilos.listo}>Hoy no hay tareas.</p>}
          <div className={estilos.grupos}>
            {grupos.map((g) => (
              <div key={g.tema} className={estilos.grupo}>
                <h3>{g.titulo}</h3>
                <div className={estilos.tareas}>
                  {g.tareas.map((t) => (
                    <Tarea key={t.clave} tarea={t} conTema={false} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`tarjeta ${estilos.bloque}`}>
          <header>
            <span className="etiqueta">Etapas</span>
          </header>
          <ol className={estilos.etapas}>
            {plan.etapas.map((e, i) => {
              const suDia = e.id === "repaso" ? plan.dias - 1 : e.id === "simulacro" ? plan.dias : null;
              const futura = suDia && plan.dia < suDia;
              return (
              <li key={e.id}>
                <span>
                  <strong>
                    {i + 1}. {e.titulo}
                  </strong>
                  <small>{futura ? `el día ${suDia}` : e.hechas === e.total ? "terminada" : e.ejercicios.total ? `${e.ejercicios.hechos}/${e.ejercicios.total} ejercicios · faltan ${duracion(e.minutosFaltan)}` : `faltan ${duracion(e.minutosFaltan)}`}</small>
                </span>
                <span className={estilos.barra} aria-hidden>
                  <i style={{ width: `${futura ? 0 : e.porcentaje * 100}%` }} />
                </span>
              </li>
              );
            })}
          </ol>
        </section>
      </div>

      <section className={`tarjeta ${estilos.bloque}`}>
        <header>
          <span className="etiqueta">Tu temario</span>
          <small>
            {plan.temas.filter((t) => t.estado === "hecho").length} de {plan.temas.length} cerrados
          </small>
        </header>
        <ol className={estilos.temario}>
          {plan.temas.map((t) => (
            <li key={t.id} data-estado={t.estado} title={`${NOMBRE_ETAPA[t.etapa] ?? ""}: ${t.hechas} de ${t.total} tareas`}>
              <strong>{t.titulo}</strong>
              <small>
                {t.hechas}/{t.total}
              </small>
              <span className={estilos.barra} aria-hidden>
                <i style={{ width: `${t.porcentaje * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Incluye>
        {ajustando ? (
          <div className={estilos.ajustes}>
            <button type="button" className="boton" onClick={() => cambiar({ inicio: plan.hoyFecha, dias: plan.dias })}>
              Reiniciar desde hoy
            </button>
            {[10, 15, 21, 30]
              .filter((d) => d !== plan.dias)
              .map((d) => (
                <button key={d} type="button" className="boton" onClick={() => cambiar({ inicio: plan.inicio, dias: d })}>
                  Pasar a {d} días
                </button>
              ))}
            <button type="button" className="boton boton-fantasma" onClick={() => cambiar("quitar")}>
              Quitar el plan
            </button>
          </div>
        ) : (
          <button type="button" className={estilos.enlace} onClick={() => setAjustando(true)}>
            Cambiar fechas o duración
          </button>
        )}
      </Incluye>
    </div>
  );
}

/** Lo que queda fuera del plan, para que quede claro que no hace falta ahora. */
function Incluye({ children }) {
  return (
    <section className={estilos.fuera}>
      <span className="etiqueta">
        <IconoCandado tamano={12} /> Para crecer, no ahora
      </span>
      <p>
        {PARA_CRECER.map((x) => (
          <span key={x} className="chip">
            {x}
          </span>
        ))}
      </p>
      {children}
    </section>
  );
}
