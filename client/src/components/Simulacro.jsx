import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { api } from "../lib/api.js";
import { ES_MOVIL } from "../lib/modo.js";
import { subirArriba } from "../hooks/useScrollSuave.js";
import { armarProceso, minutosProceso, ORDEN_ETAPAS, planRefuerzo } from "../../../server/simulacro.js";
import { Tarjeta } from "./Tarjeta.jsx";
import { Grabadora } from "./Grabadora.jsx";
import { Markdown } from "./Markdown.jsx";
import { Cronometro, mmss } from "./Cronometro.jsx";
import { InformeIa } from "./InformeIa.jsx";
import estilos from "./Simulacro.module.css";
import { IconoEntrevistas, IconoPracticar, IconoTrabajo } from "./Iconos.jsx";
import { feedback } from "../lib/feedback.js";

/** Lo que mira un entrevistador además de la respuesta correcta. */
const COMUNICACION = [
  {
    id: "aclarar",
    texto: "Aclaré el problema antes de empezar (preguntas, supuestos)",
    consejo: "aclara el problema antes de empezar",
  },
  {
    id: "ejemplos",
    texto: "Usé ejemplos concretos",
    consejo: "usa ejemplos concretos",
  },
  {
    id: "plan",
    texto: "Expliqué mi plan antes de escribir código",
    consejo: "explica tu plan antes de escribir código",
  },
  {
    id: "voz-alta",
    texto: "Pensé en voz alta todo el tiempo",
    consejo: "piensa en voz alta todo el tiempo",
  },
  {
    id: "probar",
    texto: "Probé mi solución con un caso y un caso borde",
    consejo: "prueba tu solución con un caso normal y uno borde",
  },
];

const TEXTOS = {
  sabia: "Lo sabía",
  dude: "Dudé",
  no: "No lo sabía",
  hecho: "Lo resolví",
  "no-llegue": "No llegué",
};
const ICONOS = { rrhh: <IconoEntrevistas />, tecnica: <IconoPracticar />, proyecto: <IconoTrabajo />, cierre: "✓" };

/**
 * Simulacro de entrevista por etapas, como un proceso real: recursos humanos, técnica (con
 * repreguntas sobre tu ejercicio), presentación de tu proyecto y cierre. Puedes hacerlo completo
 * o una etapa suelta. Las reglas (qué preguntas, plan de refuerzo) están en server/simulacro.js.
 * @param {{ proceso: object, alRepasar?: (categoria: string) => void, alIr?: (pestana: string) => void }} props
 */
export function Simulacro({ proceso, alRepasar, alIr }) {
  const [estado, setEstado] = useState("inicio"); // inicio | curso | fin
  const [etapas, setEtapas] = useState(ORDEN_ETAPAS);
  const [pasos, setPasos] = useState([]);
  const [paso, setPaso] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [fin, setFin] = useState(0);
  const [ingles, setIngles] = useState(false);
  const [checks, setChecks] = useState([]);
  const [tusPreguntas, setTusPreguntas] = useState([]);
  const [reflexion, setReflexion] = useState({});
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState({}); // paso -> { r, respuesta }: lo que evaluó la IA
  const [informe, setInforme] = useState(null);

  async function empezar(elegidas) {
    setCargando(true);
    try {
      const [tarjetas, ejercicios] = await Promise.all([api.tarjetas({}), api.ejerciciosEntrevista()]);
      setEtapas(elegidas);
      setPasos(armarProceso({ tarjetas, ejercicios, proceso, etapas: elegidas }));
      setPaso(0);
      setResultados([]);
      setChecks([]);
      setTusPreguntas([]);
      setReflexion({});
      setEvaluaciones({});
      setInforme(null);
      setGuardado(false);
      setInicio(Date.now());
      setEstado("curso");
    } finally {
      setCargando(false);
    }
  }

  function avanzar(resultado = null) {
    const nuevos = [...resultados, resultado];
    setResultados(nuevos);
    if (paso + 1 >= pasos.length) {
      setFin(Date.now());
      setEstado("fin");
    } else {
      setPaso(paso + 1);
    }
    subirArriba({ suave: true });
  }

  async function calificar(nota) {
    await api.calificar(pasos[paso].p.id, nota);
    avanzar(nota);
  }

  const minutos = minutosProceso(proceso, etapas);

  if (estado === "inicio") {
    return <Portada proceso={proceso} ingles={ingles} setIngles={setIngles} cargando={cargando} alEmpezar={empezar} />;
  }

  if (estado === "fin") {
    const tituloDe = (e) => proceso?.etapas?.find((x) => x.id === e)?.titulo ?? e;
    // Lo que la IA necesita para el balance: cada paso con su nota y, si lo evaluaste con IA, tu respuesta
    const itemsInforme = pasos
      .map((p, i) => {
        const ev = evaluaciones[i];
        const pregunta =
          p.tipo === "ejercicio" ? `Ejercicio en vivo: ${p.ej.titulo}` : p.tipo === "pitch" ? "Preséntate y cuéntanos de tu proyecto en un minuto" : p.p?.pregunta;
        return { etapa: tituloDe(p.etapa), pregunta, nota: resultados[i], puntaje: ev?.r.puntaje, falta: ev?.r.falta, respuesta: ev?.respuesta };
      })
      .filter((x) => x.pregunta && x.nota);
    const notasInforme = (proceso?.reflexion ?? [])
      .filter((q) => reflexion[q.id]?.trim())
      .map((q) => `${q.pregunta} ${reflexion[q.id].trim()}`)
      .join(" | ");
    return (
      <Final
        {...{
          itemsInforme,
          notasInforme,
          informe,
          setInforme,
          ingles,
          pasos,
          resultados,
          checks,
          setChecks,
          reflexion,
          setReflexion,
          guardado,
          minutos,
          alRepasar,
          alIr,
        }}
        preguntasReflexion={proceso?.reflexion}
        tusPreguntas={tusPreguntas.length}
        segundos={Math.round((fin - inicio) / 1000)}
        alGuardar={async (plan) => {
          // Terminar un simulacro completo se celebra como un logro
          feedback.logro("logro");
          await api.guardarSimulacro?.({
            segundos: Math.round((fin - inicio) / 1000),
            ingles,
            etapas,
            pasos: pasos
              .map((p, i) => ({
                tipo: p.tipo,
                etapa: p.etapa,
                id: p.ej?.id ?? p.p?.id ?? null,
                resultado: resultados[i],
              }))
              .filter((p) => p.tipo !== "etapa"),
            comunicacion: checks,
            tusPreguntas,
            reflexion,
            plan: plan.map((x) => x.texto),
            // Del informe de la IA se guarda lo esencial, para no engordar el progreso
            ...(informe ? { informe: { puntaje: informe.puntaje, nivel: informe.nivel, resumen: informe.resumen, plan: informe.plan } } : {}),
          });
          setGuardado(true);
        }}
        alOtro={() => setEstado("inicio")}
      />
    );
  }

  const actual = pasos[paso];
  return (
    <div className={estilos.curso}>
      <div className={estilos.barraSuperior}>
        <ol className={estilos.etapas} aria-label="Etapas">
          {etapas.map((e) => {
            const indiceEtapa = etapas.indexOf(e);
            const indiceActual = etapas.indexOf(actual.etapa);
            return (
              <li key={e} data-estado={indiceEtapa < indiceActual ? "hecha" : indiceEtapa === indiceActual ? "actual" : "pendiente"}>
                {proceso?.etapas?.find((x) => x.id === e)?.titulo ?? e}
              </li>
            );
          })}
        </ol>
        <Cronometro inicio={inicio} segundos={minutos * 60} />
      </div>

      <motion.div
        key={paso}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <Paso
          actual={actual}
          ingles={ingles}
          alCalificar={calificar}
          alAvanzar={avanzar}
          alEvaluar={(r, respuesta) => setEvaluaciones((v) => ({ ...v, [paso]: { r, respuesta } }))}
          alElegirPreguntas={setTusPreguntas}
          tusPreguntas={tusPreguntas}
        />
      </motion.div>
    </div>
  );
}

function Portada({ proceso, ingles, setIngles, cargando, alEmpezar }) {
  const etapas = proceso?.etapas ?? [];
  return (
    <div className={estilos.portada}>
      <div className={`textura ${estilos.panel} ${estilos.completo}`}>
        <span className={estilos.etiqueta}>Proceso completo · {minutosProceso(proceso)} minutos</span>
        <h2>Como una entrevista de verdad, de principio a fin</h2>
        <p>
          Recursos humanos, entrevista técnica con un ejercicio en vivo, presentación de tu proyecto y cierre. Responde todo{" "}
          <strong>en voz alta</strong> y grábate: es la forma más rápida de mejorar cómo suenas.
        </p>
        <label className={estilos.nota}>
          <input type="checkbox" checked={ingles} onChange={(e) => setIngles(e.target.checked)} /> Hacerlo en inglés (las preguntas y tus
          respuestas)
        </label>
        <button type="button" className="boton boton-primario" disabled={cargando} onClick={() => alEmpezar(ORDEN_ETAPAS)}>
          Empezar el proceso completo
        </button>
      </div>

      <h3 className={estilos.subtitulo}>O practica una etapa suelta</h3>
      <div className={estilos.gridEtapas}>
        {etapas.map((e, i) => (
          <button key={e.id} type="button" className={`brillo ${estilos.etapa}`} disabled={cargando} onClick={() => alEmpezar([e.id])}>
            <span className={estilos.etapaNumero} aria-hidden>
              {ICONOS[e.id] ?? i + 1}
            </span>
            <strong>{e.titulo}</strong>
            <span className={estilos.etapaMinutos}>{e.minutos} min</span>
            <span className={estilos.etapaTexto}>{e.descripcion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Paso({ actual, ingles, alCalificar, alAvanzar, alEvaluar, alElegirPreguntas, tusPreguntas }) {
  if (actual.tipo === "etapa") {
    return (
      <div className={`${estilos.panel} ${estilos.portadaEtapa}`}>
        <span className={estilos.etiqueta}>Etapa · {actual.info.minutos} minutos</span>
        <h2>{actual.info.titulo}</h2>
        <p>{actual.info.descripcion}</p>
        <button type="button" className="boton boton-primario" onClick={() => alAvanzar(null)}>
          Empezar esta etapa
        </button>
      </div>
    );
  }

  if (actual.tipo === "pregunta") {
    return <Tarjeta key={actual.p.id} pregunta={actual.p} alCalificar={alCalificar} alEvaluar={alEvaluar} grabar enIngles={ingles} />;
  }

  if (actual.tipo === "repregunta") {
    const p = {
      ...actual.p,
      categoria: "El entrevistador repregunta sobre tu ejercicio",
    };
    return <Tarjeta key={p.id} pregunta={p} alCalificar={alAvanzar} alEvaluar={alEvaluar} grabar enIngles={false} />;
  }

  if (actual.tipo === "ejercicio") {
    return (
      <div className={estilos.panel}>
        <span className={estilos.etiqueta}>Ejercicio en vivo</span>
        <h2>{actual.ej.titulo}</h2>
        <p>
          Ábrelo en una pestaña nueva y resuélvelo mientras explicas en voz alta: entender, ejemplos, plan, código y probar. Date unos 15
          minutos, como en una entrevista. Después el entrevistador te hará preguntas sobre tu solución.
        </p>
        <div className={estilos.acciones}>
          <a className="boton boton-primario" href={`/practicar/${actual.ej.id}`} target={ES_MOVIL ? undefined : "_blank"} rel="noreferrer">
            Abrir el ejercicio
          </a>
          <button type="button" className="boton" onClick={() => alAvanzar("hecho")}>
            Lo resolví
          </button>
          <button type="button" className="boton boton-fantasma" onClick={() => alAvanzar("no-llegue")}>
            No llegué
          </button>
        </div>
      </div>
    );
  }

  if (actual.tipo === "pitch") return <PasoPitch alCalificar={alAvanzar} />;

  return (
    <PasoTusPreguntas
      sugeridas={actual.sugeridas}
      elegidas={tusPreguntas}
      alElegir={alElegirPreguntas}
      alTerminar={() => alAvanzar(null)}
    />
  );
}

function PasoPitch({ alCalificar }) {
  const [visto, setVisto] = useState(false);
  const [pitch, setPitch] = useState(null);
  return (
    <div className={estilos.panel}>
      <span className={estilos.etiqueta}>Tu presentación</span>
      <h2>"Preséntate y cuéntanos de tu proyecto en un minuto."</h2>
      <p>Dilo sin leer, grabándote. Después compáralo con el pitch que escribiste.</p>
      <Grabadora clave="simulacro:pitch" maxSegundos={90} texto="Grabar mi pitch" />
      {!visto ? (
        <button
          type="button"
          className="boton"
          onClick={async () => {
            const mis = await api.misRespuestas();
            setPitch(mis?.pitch?.trim() ?? "");
            setVisto(true);
          }}
        >
          Ver mi pitch escrito
        </button>
      ) : (
        <div className={estilos.pitch}>
          {pitch ? <Markdown>{pitch}</Markdown> : <p>Todavía no escribiste tu pitch. Hazlo en la pestaña "Pitch y STAR" al terminar.</p>}
        </div>
      )}
      <div className={estilos.acciones}>
        <span className={estilos.nota}>¿Cómo te salió?</span>
        <button type="button" className="boton" data-tipo="error" onClick={() => alCalificar("no")}>
          Me trabé
        </button>
        <button type="button" className="boton" data-tipo="aviso" onClick={() => alCalificar("dude")}>
          Regular
        </button>
        <button type="button" className="boton boton-primario" onClick={() => alCalificar("sabia")}>
          Fluido
        </button>
      </div>
    </div>
  );
}

function PasoTusPreguntas({ sugeridas, elegidas, alElegir, alTerminar }) {
  const [propia, setPropia] = useState("");
  const alternar = (texto) => alElegir((v) => (v.includes(texto) ? v.filter((x) => x !== texto) : [...v, texto]));
  return (
    <div className={estilos.panel}>
      <span className={estilos.etiqueta}>Cierre</span>
      <h2>"¿Tienes alguna pregunta para nosotros?"</h2>
      <p>Elige 2 o 3 que harías de verdad, o escribe la tuya. Dilas en voz alta.</p>
      <ul className={estilos.opciones}>
        {[...sugeridas, ...elegidas.filter((e) => !sugeridas.includes(e))].map((s) => (
          <li key={s}>
            <label>
              <input type="checkbox" checked={elegidas.includes(s)} onChange={() => alternar(s)} /> {s}
            </label>
          </li>
        ))}
      </ul>
      <form
        className={estilos.propia}
        onSubmit={(e) => {
          e.preventDefault();
          const t = propia.trim();
          if (t && !elegidas.includes(t)) alElegir((v) => [...v, t]);
          setPropia("");
        }}
      >
        <input
          className="campo"
          value={propia}
          onChange={(e) => setPropia(e.target.value)}
          placeholder="Mi propia pregunta…"
          maxLength={200}
        />
        <button type="submit" className="boton">
          Agregar
        </button>
      </form>
      <button type="button" className="boton boton-primario" onClick={alTerminar}>
        Terminar la entrevista
      </button>
    </div>
  );
}

function Final({
  itemsInforme,
  notasInforme,
  informe,
  setInforme,
  ingles,
  preguntasReflexion,
  pasos,
  resultados,
  segundos,
  minutos,
  checks,
  setChecks,
  reflexion,
  setReflexion,
  tusPreguntas,
  guardado,
  alGuardar,
  alOtro,
  alRepasar,
  alIr,
}) {
  // La lista de comunicación es de la entrevista técnica: sin esa etapa no se muestra ni cuenta
  const conTecnica = pasos.some((p) => p.etapa === "tecnica");
  const plan = useMemo(
    () =>
      planRefuerzo(pasos, resultados, {
        comunicacion: checks,
        comunicacionTotal: conTecnica ? COMUNICACION : [],
        tusPreguntas,
      }),
    [pasos, resultados, checks, tusPreguntas, conTecnica],
  );
  const conNota = pasos.map((p, i) => ({ p, r: resultados[i] })).filter((x) => x.r);
  const bien = conNota.filter((x) => ["sabia", "hecho"].includes(x.r)).length;
  const porEtapa = ORDEN_ETAPAS.map((e) => ({
    e,
    items: conNota.filter((x) => x.p.etapa === e),
  })).filter((g) => g.items.length);
  const tituloEtapa = (e) => pasos.find((p) => p.tipo === "etapa" && p.etapa === e)?.info.titulo ?? e;
  const accion = (x) => {
    if (x.tipo === "mazo") return alRepasar && { texto: "Repasar", hacer: () => alRepasar(x.categoria) };
    if (x.tipo === "pitch") return alIr && { texto: "Ir al pitch", hacer: () => alIr("personal") };
    if (x.tipo === "voz-alta") return alIr && { texto: "Ver la guía", hacer: () => alIr("guia") };
    return null;
  };

  return (
    <div className={estilos.final}>
      <div className={`${estilos.panel} ${estilos.cabeceraFinal}`}>
        <span className={estilos.etiqueta}>Entrevista terminada</span>
        <div className={estilos.cifras}>
          <div>
            <strong>
              {bien}/{conNota.length}
            </strong>
            <span>respuestas bien</span>
          </div>
          <div>
            <strong>{mmss(segundos)}</strong>
            <span>
              de {minutos}:00{segundos > minutos * 60 ? ", te pasaste" : ""}
            </span>
          </div>
          <div>
            <strong>{tusPreguntas}</strong>
            <span>preguntas tuyas</span>
          </div>
        </div>
      </div>

      <div className={estilos.columnas}>
        {porEtapa.length > 0 && (
          <div className={estilos.panel}>
            <h3>Cómo te fue por etapa</h3>
            {porEtapa.map(({ e, items }) => (
              <div key={e} className={estilos.grupo}>
                <span className={estilos.etiqueta}>{tituloEtapa(e)}</span>
                <ol className={estilos.resumen}>
                  {items.map(({ p, r }, i) => (
                    <li key={i}>
                      <span>
                        {p.tipo === "ejercicio"
                          ? `Ejercicio: ${p.ej.titulo}`
                          : p.tipo === "pitch"
                            ? "Tu pitch de un minuto"
                            : p.p.pregunta.replaceAll("`", "")}
                      </span>
                      <strong data-ok={["sabia", "hecho"].includes(r)}>
                        {p.tipo === "pitch"
                          ? {
                              sabia: "Fluido",
                              dude: "Regular",
                              no: "Me trabé",
                            }[r]
                          : TEXTOS[r]}
                      </strong>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        <div className={estilos.panel}>
          {conTecnica && (
            <>
              <h3>¿Cómo te comunicaste?</h3>
              <ul className={estilos.opciones}>
                {COMUNICACION.map((c) => (
                  <li key={c.id}>
                    <label>
                      <input
                        type="checkbox"
                        disabled={guardado}
                        checked={checks.includes(c.id)}
                        onChange={(e) => setChecks((v) => (e.target.checked ? [...v, c.id] : v.filter((x) => x !== c.id)))}
                      />{" "}
                      {c.texto}
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3>Cómo te fue, en tus palabras</h3>
          {(preguntasReflexion ?? []).map((q) => (
            <label key={q.id} className={estilos.reflexion}>
              <span>{q.pregunta}</span>
              <textarea
                className="campo"
                rows={2}
                maxLength={400}
                disabled={guardado}
                value={reflexion[q.id] ?? ""}
                onChange={(e) => setReflexion((v) => ({ ...v, [q.id]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      </div>

      <InformeIa items={itemsInforme} notas={notasInforme} idioma={ingles ? "en" : "es"} informe={informe} alInforme={setInforme} />

      <div className={`${estilos.panel} ${estilos.plan}`}>
        <h3>Tu plan de refuerzo</h3>
        {plan.length === 0 ? (
          <p>Te fue muy bien: no hay nada urgente. Haz otro simulacro en unos días para mantenerlo.</p>
        ) : (
          <ol>
            {plan.map((x, i) => {
              const a = accion(x);
              return (
                <li key={i}>
                  <span>{x.texto}</span>
                  {x.tipo === "ejercicio" ? (
                    <a className="boton boton-fantasma" href={`/practicar/${x.id}`}>
                      Abrir
                    </a>
                  ) : (
                    a && (
                      <button type="button" className="boton boton-fantasma" onClick={a.hacer}>
                        {a.texto}
                      </button>
                    )
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <p className={estilos.nota}>Las preguntas que no sabías ya quedaron en tu repaso de tarjetas.</p>
        {!guardado ? (
          <button type="button" className="boton boton-primario" onClick={() => alGuardar(plan)}>
            Guardar simulacro
          </button>
        ) : (
          <button type="button" className="boton boton-primario" onClick={alOtro}>
            Hacer otro
          </button>
        )}
      </div>
    </div>
  );
}
