// Inglés con IA: ¿Cómo se dice?, daily en inglés, inglés escrito guiado, entrevista en inglés con
// ayudas que se van quitando, tus errores de siempre (mini lecciones) y explicar tu solución en inglés.
import { useState } from "react";
import { decir, hayVoz } from "../../lib/voz.js";
import { guardarErroresIngles, leerErroresIngles } from "../../lib/errores-ingles.js";
import { EvaluadorIa, ResultadoIngles } from "../EvaluadorIa.jsx";
import { IconoAudio } from "../Iconos.jsx";
import { CajaIa, estilosIa as base } from "./CajaIa.jsx";
import { ChatIa } from "./ChatIa.jsx";
import { CrearTarjeta } from "./CrearTarjeta.jsx";
import { useIa } from "./useIa.js";
import estilos from "./Ia.module.css";

function Escuchar({ texto }) {
  if (!hayVoz()) return null;
  return (
    <button type="button" className={estilos.enlinea} onClick={() => decir(texto, { idioma: "en" })} aria-label="Escuchar">
      <IconoAudio tamano={14} />
    </button>
  );
}

/** Todo junto, en una rejilla (página Inglés > Con IA). */
export function InglesIa() {
  return (
    <div className={estilos.rejilla}>
      <ComoSeDice />
      <EntrevistaIngles />
      <EscritoGuiado />
      <DailyIngles />
      <ErroresDeSiempre />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
export function ComoSeDice() {
  return (
    <CajaIa titulo="¿Cómo se dice?" detalle="Escribe en español lo que quieres decir en el trabajo y te doy formas naturales de decirlo.">
      {(olvidar) => <ComoSeDiceContenido olvidar={olvidar} />}
    </CajaIa>
  );
}

function ComoSeDiceContenido({ olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);
  return (
    <>
      <div className={base.fila}>
        <input
          className={base.entrada}
          style={{ flex: 1, minWidth: 200 }}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={async (e) => e.key === "Enter" && texto.trim() && setR(await pedir({ tarea: "como-se-dice", texto }))}
          placeholder="Por ejemplo: ya casi lo termino, solo me falta probarlo"
        />
        <button type="button" className="boton boton-primario" disabled={cargando || !texto.trim()} onClick={async () => setR(await pedir({ tarea: "como-se-dice", texto }))}>
          {cargando ? "…" : "¿Cómo se dice?"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
      {r && (
        <div className={base.resultado}>
          <ul style={{ margin: 0, paddingLeft: "1.1em", display: "grid", gap: 6 }}>
            {r.opciones.map((o, i) => (
              <li key={i}>
                <strong lang="en">{o.en}</strong> <Escuchar texto={o.en} />
                <br />
                <small className={base.suave}>{o.cuando}</small>
              </li>
            ))}
          </ul>
          {r.nota && <p className={estilos.nota}>{r.nota}</p>}
          <CrearTarjeta origen="¿Cómo se dice?" texto="+ Tarjeta" contenido={`Cómo se dice en inglés (tarjeta del mazo de inglés): "${texto}" = ${r.opciones.map((o) => o.en).join(" / ")}`} />
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
export function DailyIngles() {
  return (
    <CajaIa titulo="Tu daily en inglés" detalle="Di o escribe tu actualización: qué hiciste ayer, qué harás hoy y si algo te bloquea.">
      {() => (
        <EvaluadorIa
          tarea="ingles"
          idioma="en"
          textoBoton="Corregir mi daily"
          pedido={{ pregunta: "Give your daily stand-up update to your team: what you did yesterday, what you will do today, and if anything is blocking you.", nivel: "B2" }}
        />
      )}
    </CajaIa>
  );
}

// ---------------------------------------------------------------------------------------------
const SITUACIONES = [
  { id: "ayuda", nombre: "Pedir ayuda por Slack", texto: "A Slack message to a senior teammate asking for help with a bug you have been stuck on for an hour." },
  { id: "pr", nombre: "Descripción de un PR", texto: "The description of a pull request: what it changes, why, and how to test it." },
  { id: "estado", nombre: "Avisar un retraso", texto: "A message to your team lead saying your task will take one more day and why." },
  { id: "reclutador", nombre: "Correo a un reclutador", texto: "A short email to a recruiter answering their message about a junior frontend role and asking for next steps." },
];

export function EscritoGuiado() {
  return (
    <CajaIa titulo="Inglés escrito del trabajo" detalle="Escríbelo como puedas, en español o en inglés a medias, y te lo devuelvo listo para enviar con cada cambio explicado.">
      {(olvidar) => <EscritoContenido olvidar={olvidar} />}
    </CajaIa>
  );
}

function EscritoContenido({ olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [situacion, setSituacion] = useState(SITUACIONES[0]);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);
  return (
    <>
      <div className={estilos.chips}>
        {SITUACIONES.map((s) => (
          <button key={s.id} type="button" className={estilos.chip} data-activo={s.id === situacion.id} onClick={() => (setSituacion(s), setR(null))}>
            {s.nombre}
          </button>
        ))}
      </div>
      {!r ? (
        <>
          <textarea className={base.texto} rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escríbelo como te salga. Mientras más inglés uses, más aprendes." />
          <div className={base.fila}>
            <button
              type="button"
              className="boton boton-primario"
              disabled={cargando || texto.trim().length < 5}
              onClick={async () => {
                const res = await pedir({ tarea: "escrito", situacion: situacion.texto, respuesta: texto });
                if (res) {
                  setR(res);
                  if (/[a-z]{3,}\s+(the|to|is|i|my|and|a)\s/i.test(texto)) guardarErroresIngles(res.correcciones, "Inglés escrito");
                }
              }}
            >
              {cargando ? "Revisando…" : "Pásalo a buen inglés"}
            </button>
          </div>
        </>
      ) : (
        <>
          <ResultadoIngles r={r} />
          <button type="button" className={base.enlace} onClick={() => setR(null)}>
            Escribir otro
          </button>
        </>
      )}
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
const AYUDAS = [
  ["completa", "Respuesta completa"],
  ["claves", "Solo palabras clave"],
  ["sin", "Sin ayuda"],
];
const CLAVE_ANTERIORES = "devprep.entrevistaEnAnteriores";

export function EntrevistaIngles() {
  const [ayuda, setAyuda] = useState(() => localStorage.getItem("devprep.entrevistaEnAyuda") ?? "completa");
  const [ronda, setRonda] = useState(0);
  const anteriores = () => JSON.parse(localStorage.getItem(CLAVE_ANTERIORES) ?? "[]");
  const elegir = (id) => {
    setAyuda(id);
    localStorage.setItem("devprep.entrevistaEnAyuda", id);
  };
  return (
    <CajaIa titulo="Entrevista en inglés" detalle="Distinta cada vez. Empieza leyendo la respuesta modelo en voz alta y, cuando te sientas cómodo, quita la ayuda.">
      {(olvidar) => (
        <>
          <div className={estilos.chips}>
            {AYUDAS.map(([id, nombre]) => (
              <button key={id} type="button" className={estilos.chip} data-activo={ayuda === id} onClick={() => elegir(id)}>
                {nombre}
              </button>
            ))}
          </div>
          <ChatIa
            key={ronda}
            tareaTurno="entrevista-en"
            tareaCierre="conversacion-cierre"
            datos={{ escenario: "A job interview in English for a junior frontend developer position.", anteriores: anteriores() }}
            textoEmpezar="Start the interview"
            nombreOtro="Recruiter"
            idioma="en"
            alOlvidarClave={olvidar}
            verAyuda={(u) => {
              if (!u?.pregunta || u.fin) return null;
              // Guarda las preguntas para que la próxima entrevista no las repita
              const vistas = anteriores();
              if (!vistas.includes(u.pregunta)) localStorage.setItem(CLAVE_ANTERIORES, JSON.stringify([...vistas, u.pregunta].slice(-12)));
              if (ayuda === "sin") return null;
              return (
                <div className={estilos.nota} lang="en">
                  {ayuda === "completa" ? (
                    <>
                      <small className={base.suave}>Léela en voz alta (y cámbiala con tus datos):</small>
                      <p style={{ margin: "4px 0 0" }}>
                        {u.modelo} <Escuchar texto={u.modelo} />
                      </p>
                    </>
                  ) : (
                    <>
                      <small className={base.suave}>Arma tu respuesta con:</small>
                      <div className={estilos.chips} style={{ marginTop: 4 }}>
                        {u.claves.map((c) => (
                          <span key={c} className={estilos.chip}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            }}
            verCierre={(r) => (
              <>
                <ResultadoIngles r={r} />
                <button type="button" className="boton" onClick={() => setRonda((n) => n + 1)}>
                  Otra entrevista
                </button>
              </>
            )}
            alCerrar={(r) => guardarErroresIngles(r.correcciones, "Entrevista en inglés")}
          />
        </>
      )}
    </CajaIa>
  );
}

// ---------------------------------------------------------------------------------------------
export function ErroresDeSiempre() {
  const errores = leerErroresIngles();
  return (
    <CajaIa titulo="Tus errores de siempre" detalle={`Junto los errores que repites en Map, Conversa, el daily y las entrevistas, y te armo una mini lección de cada uno. Llevas ${errores.length} guardados.`}>
      {(olvidar) => <ErroresContenido errores={errores} olvidar={olvidar} />}
    </CajaIa>
  );
}

function ErroresContenido({ errores, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [r, setR] = useState(null);
  const [practica, setPractica] = useState(null);
  if (errores.length < 3) return <p className={base.suave}>Cuando tengas al menos 3 errores corregidos (en Map, Conversa o aquí), los agrupo en lecciones.</p>;
  return (
    <>
      <div className={base.fila}>
        <button type="button" className="boton boton-primario" disabled={cargando} onClick={async () => setR(await pedir({ tarea: "errores-patrones", errores }))}>
          {cargando ? "Buscando patrones…" : r ? "Volver a revisar" : "Armar mis lecciones"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
      {r?.patrones.map((p, i) => (
        <div key={i} className={base.resultado}>
          <strong>{p.nombre}</strong>
          <p style={{ margin: 0 }}>{p.explicacion}</p>
          <ul lang="en">
            {p.ejemplos.map((e, j) => (
              <li key={j}>
                <del>{e.mal}</del> → <ins>{e.bien}</ins>
              </li>
            ))}
          </ul>
          {practica === i ? (
            <EvaluadorIa tarea="ingles" idioma="en" pedido={{ pregunta: `Dilo en inglés: "${p.practica}" (aplica: ${p.nombre})`, nivel: "B2" }} />
          ) : (
            <div className={base.fila}>
              <button type="button" className="boton" onClick={() => setPractica(i)}>
                Practicar: "{p.practica}"
              </button>
              <CrearTarjeta origen="errores de inglés" texto="+ Tarjeta" contenido={`Regla de inglés: ${p.nombre}. ${p.explicacion} Ejemplos: ${p.ejemplos.map((e) => `${e.mal} → ${e.bien}`).join("; ")}`} />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
/** En Entrénalo: explicar tu solución en inglés (contenido técnico y gramática a la vez). */
export function ExplicaloIngles({ titulo, codigo }) {
  return (
    <CajaIa titulo="Explícalo en inglés" detalle='Como en una entrevista remota: "walk me through your solution". Te corrijo lo técnico y la gramática.'>
      {(olvidar) => <ExplicaloInglesContenido titulo={titulo} codigo={codigo} olvidar={olvidar} />}
    </CajaIa>
  );
}

function ExplicaloInglesContenido({ titulo, codigo, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);
  const pregunta = `Walk me through your solution to "${titulo}": the main idea, the steps and why it works.`;
  if (r) {
    return (
      <>
        <p className={estilos.nota}>
          Contenido: {r.tecnico.puntaje}/10. {r.tecnico.resumen}
        </p>
        <ResultadoIngles r={r.ingles} />
        <button type="button" className={base.enlace} onClick={() => setR(null)}>
          Intentar otra vez
        </button>
      </>
    );
  }
  return (
    <>
      <p className={base.suave} lang="en" style={{ margin: 0 }}>
        {pregunta}
      </p>
      <textarea className={base.texto} rows={4} lang="en" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="First, I... Then... It works because..." />
      <div className={base.fila}>
        <button
          type="button"
          className="boton boton-primario"
          disabled={cargando || texto.trim().split(/\s+/).length < 5}
          onClick={async () => {
            // Dos revisiones a la vez: el contenido (como entrevistador) y el inglés (como profesor)
            const [tecnico, ingles] = await Promise.all([
              pedir({ tarea: "entrevista", pregunta, categoria: "Explicar tu solución en inglés", idioma: "en", codigo, claves: ["La idea principal", "Los pasos en orden", "Por qué funciona", "La complejidad o un caso borde"], omitir: ["repregunta"], respuesta: texto }),
              pedir({ tarea: "ingles", pregunta, nivel: "B2", respuesta: texto }),
            ]);
            if (tecnico && ingles) {
              setR({ tecnico, ingles });
              guardarErroresIngles(ingles.correcciones, "Explícalo en inglés");
            }
          }}
        >
          {cargando ? "Revisando…" : "Revisar"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}
