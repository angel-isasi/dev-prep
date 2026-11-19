// Conversa con IA (/ingles/conversa): una charla en inglés en una situación de trabajo de dev.
// Eliges el escenario, la IA abre la conversación y respondes escribiendo o dictando. Durante la
// charla no te corrige (como una persona real); al terminar te da tus errores corregidos.
// Cada turno usa el modelo barato: una charla completa cuesta menos de un centavo.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { pedirIa } from "../../lib/ia.js";
import { dictar, hablar, microDisponible, useHayVoz } from "../../lib/voz.js";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { PuertaIa, ResultadoIngles } from "../../components/EvaluadorIa.jsx";
import { IconoAudio, IconoMicrofono } from "../../components/Iconos.jsx";
import estilos from "./Conversa.module.css";

/** Escenarios: lo que lee la IA (en inglés) y lo que ves tú. */
export const ESCENARIOS = [
  {
    id: "entrevista",
    titulo: "Entrevista en inglés",
    sub: "Te contratan para un puesto remoto",
    rol: "You are a friendly recruiter at a US software company interviewing a junior frontend developer from Peru for a remote position. Ask one question at a time: about themselves, a project they built, why frontend, how they work in a team, and their questions for you.",
  },
  {
    id: "daily",
    titulo: "Daily standup",
    sub: "Qué hiciste, qué harás, qué te bloquea",
    rol: "You are the team lead running the daily standup of a small remote web team. The student is the junior frontend developer. Ask what they did yesterday, what they will do today and if anything is blocking them; react to their answers and ask short follow-up questions.",
  },
  {
    id: "codigo",
    titulo: "Explica tu código",
    sub: "Un senior revisa tu pull request",
    rol: "You are a senior developer reviewing the student's pull request: a React component that lists products with a search filter. Ask them to explain what the PR does, why they made some choices (state, useEffect, keys in lists) and how they tested it. Be curious, not harsh.",
  },
  {
    id: "bloqueo",
    titulo: "Pedir ayuda",
    sub: "Estás trabado con un bug",
    rol: "You are a tech lead on a call. The student, a junior frontend developer, is blocked by a bug (the page shows an empty list after fetching data). Help them by asking what they tried, what they expected, what they see and what error appears; guide them without giving the answer directly.",
  },
  {
    id: "primer-dia",
    titulo: "Primer día",
    sub: "Charla con tu nuevo equipo",
    rol: "You are a friendly teammate welcoming the student on their first day as a junior frontend developer. Make small talk: where they are from, what they studied, what they like to build, the tools the team uses, and plans for the first week.",
  },
];

const MIN_TURNOS = 2; // intervenciones tuyas para poder pedir la corrección

export function ConversaMovil() {
  const [escenario, setEscenario] = useState(null);

  return (
    <section className={estilos.pagina}>
      <Link to="/ingles" className={estilos.volver}>
        ← Inglés
      </Link>
      <CabeceraPagina etiqueta="Inglés con IA" titulo="Conversa">
        Una charla en inglés en una situación de trabajo. La IA no te corrige mientras hablas: al terminar te da tus errores corregidos.
      </CabeceraPagina>
      <PuertaIa>
        {(olvidarClave) =>
          escenario ? (
            <Charla key={escenario.id} escenario={escenario} alSalir={() => setEscenario(null)} alOlvidarClave={olvidarClave} />
          ) : (
            <ul className={estilos.escenarios}>
              {ESCENARIOS.map((e) => (
                <li key={e.id}>
                  <button type="button" className={estilos.escenario} onClick={() => setEscenario(e)}>
                    <strong>{e.titulo}</strong>
                    <span>{e.sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          )
        }
      </PuertaIa>
    </section>
  );
}

function Charla({ escenario, alSalir, alOlvidarClave }) {
  const [historial, setHistorial] = useState([]); // [{ de: "ia" | "yo", texto }]
  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const [error, setError] = useState(null);
  const [fin, setFin] = useState(false);
  const [correccion, setCorreccion] = useState(null);
  const [corrigiendo, setCorrigiendo] = useState(false);
  const [dictando, setDictando] = useState(false);
  const [leerEnVoz, setLeerEnVoz] = useState(true);
  const hayVoz = useHayVoz();
  const dictado = useRef(null);
  const inicio = useRef(Date.now());
  const guardado = useRef(false);
  const vivo = useRef(true);
  const abajo = useRef(null);

  useEffect(() => {
    vivo.current = true;
    turno([]);
    return () => {
      vivo.current = false;
      dictado.current?.detener();
      globalThis.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    abajo.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [historial.length, esperando, correccion]);

  /** Pide la siguiente línea de la IA a partir de lo dicho hasta ahora. */
  async function turno(lista) {
    setEsperando(true);
    setError(null);
    try {
      const r = await pedirIa({ tarea: "conversacion", escenario: escenario.rol, historial: lista });
      if (!vivo.current) return;
      setHistorial([...lista, { de: "ia", texto: r.respuesta }]);
      if (r.fin) setFin(true);
      if (leerEnVoz && hayVoz) hablar(r.respuesta);
    } catch (e) {
      if (!vivo.current) return;
      if (e.clave) alOlvidarClave();
      setError(e.message);
    } finally {
      if (vivo.current) setEsperando(false);
    }
  }

  function enviar(evento) {
    evento?.preventDefault();
    const dicho = texto.trim();
    if (!dicho || esperando) return;
    dictado.current?.detener();
    setTexto("");
    turno([...historial, { de: "yo", texto: dicho }]);
  }

  function alternarDictado() {
    if (dictando) return dictado.current?.detener();
    globalThis.speechSynthesis?.cancel();
    setError(null);
    dictado.current = dictar({
      lang: "en-US",
      alTexto: (t) => setTexto((previo) => (previo ? `${previo} ${t}` : t)),
      alTerminar: (e) => {
        setDictando(false);
        if (e) setError(e.message);
      },
    });
    setDictando(!!dictado.current);
  }

  async function corregir() {
    dictado.current?.detener();
    globalThis.speechSynthesis?.cancel();
    setCorrigiendo(true);
    setError(null);
    try {
      const r = await pedirIa({ tarea: "conversacion-cierre", escenario: escenario.rol, historial });
      if (!vivo.current) return;
      setCorreccion(r);
      setFin(true);
      // El tiempo hablando cuenta para tus minutos de inglés de hoy (una sola vez por charla)
      if (!guardado.current) {
        guardado.current = true;
        const tuyos = historial.filter((t) => t.de === "yo").length;
        await api.terminarConversacion?.({ xp: Math.min(30, tuyos * 3), segundos: (Date.now() - inicio.current) / 1000 });
      }
    } catch (e) {
      if (!vivo.current) return;
      if (e.clave) alOlvidarClave();
      setError(e.message);
    } finally {
      if (vivo.current) setCorrigiendo(false);
    }
  }

  const tuyos = historial.filter((t) => t.de === "yo").length;

  return (
    <div className={estilos.charla}>
      <div className={estilos.barra}>
        <strong>{escenario.titulo}</strong>
        <div className={estilos.acciones}>
          {hayVoz && (
            <button type="button" className="boton boton-fantasma" onClick={() => setLeerEnVoz((v) => !v)} aria-pressed={leerEnVoz}>
              <IconoAudio tamano={16} /> {leerEnVoz ? "Voz: sí" : "Voz: no"}
            </button>
          )}
          <button type="button" className="boton boton-fantasma" onClick={alSalir}>
            Cambiar escenario
          </button>
        </div>
      </div>

      <ol className={estilos.mensajes} aria-live="polite">
        {historial.map((m, i) => (
          <li key={i} className={estilos.mensaje} data-de={m.de} lang="en">
            {m.texto}
            {m.de === "ia" && hayVoz && (
              <button type="button" className={estilos.repetir} onClick={() => hablar(m.texto)} aria-label="Escuchar otra vez">
                <IconoAudio tamano={14} />
              </button>
            )}
          </li>
        ))}
        {esperando && (
          <li className={estilos.mensaje} data-de="ia" data-esperando>
            …
          </li>
        )}
      </ol>

      {error && <p className={estilos.error}>{error}</p>}

      {!fin && !correccion && (
        <form className={estilos.entrada} onSubmit={enviar}>
          <textarea
            value={texto}
            lang="en"
            rows={2}
            placeholder="Write or dictate your answer..."
            aria-label="Tu respuesta en inglés"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) enviar(e);
            }}
          />
          <div className={estilos.acciones}>
            {microDisponible() && (
              <button type="button" className="boton" onClick={alternarDictado} data-activo={dictando}>
                <IconoMicrofono tamano={16} /> {dictando ? "Detener" : "Dictar"}
              </button>
            )}
            <button type="submit" className="boton boton-primario" disabled={!texto.trim() || esperando}>
              Enviar
            </button>
          </div>
        </form>
      )}

      {!correccion && tuyos >= MIN_TURNOS && (
        <button type="button" className={`boton ${fin ? "boton-primario" : ""}`} onClick={corregir} disabled={corrigiendo || esperando}>
          {corrigiendo ? "Corrigiendo… (unos segundos)" : "Terminar y ver mis errores"}
        </button>
      )}

      {correccion && (
        <div className={estilos.correccion}>
          <ResultadoIngles r={correccion} />
          <button type="button" className="boton" onClick={alSalir}>
            Otra conversación
          </button>
        </div>
      )}
      <div ref={abajo} />
    </div>
  );
}
