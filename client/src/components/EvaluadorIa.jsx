// "Evaluar con IA": escribes o dictas tu respuesta y la IA te dice qué estuvo bien, qué faltó, cómo
// decirlo mejor y te hace una repregunta (entrevistas); o te corrige el inglés (mapache).
// Habla con la función de Vercel (lib/ia.js). Si la IA no está configurada, solo muestra un aviso.
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { claveIa, estadoIa, guardarClaveIa, guardarTopeIa, pedirIa, topeIa, usoIa } from "../lib/ia.js";
import { dictar, hablar, hayVoz, microDisponible } from "../lib/voz.js";
import { IconoAudio, IconoMicrofono } from "./Iconos.jsx";
import estilos from "./EvaluadorIa.module.css";

const VEREDICTOS = { sabia: "Lo sabías", dude: "Te faltó algo", no: "No lo respondiste bien" };
const contarPalabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;

/** Tu pitch y tus historias STAR, para que la IA use tus proyectos reales en "así lo diría mejor". */
export async function contextoPersonal() {
  try {
    const mis = await api.misRespuestas?.();
    if (!mis) return "";
    const historias = (mis.historias ?? [])
      .filter((h) => h.situacion || h.accion)
      .slice(0, 4)
      .map((h) => `- ${h.titulo}: ${[h.situacion, h.tarea, h.accion, h.resultado].filter(Boolean).join(" ")}`);
    return [mis.pitch?.trim() ? `Pitch: ${mis.pitch.trim()}` : "", historias.length ? `Historias:\n${historias.join("\n")}` : ""].filter(Boolean).join("\n\n");
  } catch {
    return "";
  }
}

/**
 * La puerta de todo lo que usa IA: mientras no esté configurada en Vercel muestra un aviso, y si falta
 * tu contraseña la pide. Cuando todo está listo dibuja lo de adentro.
 * @param {{ children: (olvidarClave: () => void) => import("react").ReactNode }} props
 */
export function PuertaIa({ children }) {
  const [listo, setListo] = useState(null); // null: averiguando
  const [clave, setClave] = useState(claveIa);

  useEffect(() => {
    estadoIa().then((e) => setListo(e.configurada));
  }, []);

  if (listo === null) return null;
  if (!listo) {
    return <p className={estilos.apagado}>Evaluación con IA: se activa cuando configures tu API key en Vercel.</p>;
  }

  if (!clave) {
    return (
      <form
        className={estilos.caja}
        onSubmit={(e) => {
          e.preventDefault();
          const valor = new FormData(e.currentTarget).get("clave")?.toString().trim();
          if (valor) {
            guardarClaveIa(valor);
            setClave(valor);
          }
        }}
      >
        <span className={estilos.etiqueta}>Evaluar con IA</span>
        <p className={estilos.suave}>Escribe tu contraseña de IA (la que pusiste en Vercel). Se guarda solo en este navegador.</p>
        <div className={estilos.fila}>
          <input name="clave" type="password" autoComplete="off" aria-label="Contraseña de IA" className={estilos.entrada} />
          <button type="submit" className="boton">
            Guardar
          </button>
        </div>
      </form>
    );
  }

  return children(() => {
    guardarClaveIa("");
    setClave("");
  });
}

/** Cuánto llevas gastado este mes y tu tope (la cuenta vive en este navegador). */
export function UsoIa() {
  const [tope, setTope] = useState(topeIa);
  const uso = usoIa();
  return (
    <details className={estilos.uso}>
      <summary>
        Uso de IA este mes: {uso.usd.toFixed(2)} de {tope} USD ({uso.pedidos} {uso.pedidos === 1 ? "pedido" : "pedidos"})
      </summary>
      <label>
        Tope mensual en dólares{" "}
        <input
          type="number"
          min="1"
          max="100"
          value={tope}
          className={estilos.entrada}
          onChange={(e) => {
            const valor = Math.min(100, Math.max(1, Math.round(Number(e.target.value) || 1)));
            guardarTopeIa(valor);
            setTope(valor);
          }}
        />
      </label>
      <small>Al llegar al tope la app deja de pedir evaluaciones. La cuenta es de este navegador: el gasto exacto está en la consola de la API.</small>
    </details>
  );
}

/**
 * @param {object} props
 * @param {"entrevista"|"ingles"} props.tarea
 * @param {object} props.pedido          lo que se manda además de la respuesta (pregunta, claves, modelo, nivel...)
 * @param {string} [props.respuestaFija] si ya respondiste en otro lado (mapache): solo el botón para corregirla
 * @param {(resultado: object, respuesta: string) => void} [props.alResultado]
 * @param {"es"|"en"} [props.idioma]     idioma en que respondes (para el dictado)
 */
export function EvaluadorIa(props) {
  return <PuertaIa>{(olvidarClave) => <Evaluador {...props} alOlvidarClave={olvidarClave} />}</PuertaIa>;
}

function Evaluador({ tarea, pedido, respuestaFija, alResultado, idioma = "es", alOlvidarClave }) {
  const [texto, setTexto] = useState("");
  const [dictando, setDictando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [repregunta, setRepregunta] = useState(null); // seguir con la repregunta de la IA
  const dictado = useRef(null);

  useEffect(() => () => dictado.current?.detener(), []);

  const respuesta = respuestaFija ?? texto;
  const preguntaActual = repregunta ?? pedido.pregunta;

  function alternarDictado() {
    if (dictando) {
      dictado.current?.detener();
      return;
    }
    setError(null);
    dictado.current = dictar({
      lang: idioma === "en" ? "en-US" : "es-PE",
      alTexto: (t) => setTexto((previo) => (previo ? `${previo} ${t}` : t)),
      alTerminar: (e) => {
        setDictando(false);
        if (e) setError(e.message);
      },
    });
    setDictando(!!dictado.current);
  }

  async function evaluar() {
    dictado.current?.detener();
    setCargando(true);
    setError(null);
    try {
      const extra = tarea === "entrevista" ? { contexto: await contextoPersonal() } : {};
      // En la repregunta no hay lista ni modelo: la IA evalúa con su propio criterio
      const base = repregunta ? { tarea, pregunta: repregunta, idioma: pedido.idioma, categoria: pedido.categoria } : { tarea, ...pedido };
      const r = await pedirIa({ ...base, ...extra, respuesta });
      setResultado(r);
      if (!repregunta) alResultado?.(r, respuesta);
    } catch (e) {
      if (e.clave) alOlvidarClave();
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function seguirConRepregunta() {
    setRepregunta(resultado.repregunta);
    setResultado(null);
    setTexto("");
  }

  return (
    <div className={estilos.caja}>
      <div className={estilos.cabecera}>
        <span className={estilos.etiqueta}>{tarea === "ingles" ? "Corregir con IA" : repregunta ? "Repregunta" : "Evaluar con IA"}</span>
        <button
          type="button"
          className={estilos.enlace}
          onClick={alOlvidarClave}
        >
          Cambiar contraseña
        </button>
      </div>
      {repregunta && <p className={estilos.repreguntaTexto}>{repregunta}</p>}

      {!resultado && (
        <>
          {respuestaFija === undefined && (
            <>
              <textarea
                className={estilos.texto}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={4}
                lang={idioma}
                placeholder={idioma === "en" ? "Write or dictate your answer..." : "Escribe o dicta tu respuesta, como la dirías en la entrevista..."}
              />
              <small className={estilos.suave}>{contarPalabras(texto)} palabras</small>
            </>
          )}
          <div className={estilos.fila}>
            {respuestaFija === undefined && microDisponible() && (
              <button type="button" className="boton" onClick={alternarDictado} data-activo={dictando}>
                <IconoMicrofono tamano={16} /> {dictando ? "Detener dictado" : "Dictar"}
              </button>
            )}
            <button type="button" className="boton boton-primario" onClick={evaluar} disabled={cargando || contarPalabras(respuesta) < 3}>
              {cargando ? "Evaluando… (unos segundos)" : tarea === "ingles" ? "Corregir mi inglés" : "Evaluar mi respuesta"}
            </button>
          </div>
        </>
      )}

      {error && <p className={estilos.error}>{error}</p>}

      {resultado && tarea === "entrevista" && <ResultadoEntrevista r={resultado} alSeguir={resultado.repregunta ? seguirConRepregunta : null} />}
      {resultado && tarea === "ingles" && <ResultadoIngles r={resultado} />}
      {resultado && (
        <button type="button" className={estilos.enlace} onClick={() => setResultado(null)}>
          Intentar otra respuesta
        </button>
      )}
      <UsoIa />
    </div>
  );
}

function ResultadoEntrevista({ r, alSeguir }) {
  return (
    <div className={estilos.resultado}>
      <div className={estilos.puntaje} data-veredicto={r.veredicto}>
        <strong>{r.puntaje}/10</strong>
        <span>{VEREDICTOS[r.veredicto]}</span>
      </div>
      {r.resumen && <p>{r.resumen}</p>}
      <div className={estilos.columnas}>
        {r.bien.length > 0 && (
          <div>
            <span className={estilos.subtitulo} data-tipo="bien">
              Bien
            </span>
            <ul>
              {r.bien.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
        {r.falta.length > 0 && (
          <div>
            <span className={estilos.subtitulo} data-tipo="falta">
              Te faltó
            </span>
            <ul>
              {r.falta.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {r.mejor && (
        <div className={estilos.mejor}>
          <span className={estilos.subtitulo}>Así lo dirías mejor</span>
          <p>{r.mejor}</p>
        </div>
      )}
      {r.repregunta && (
        <div className={estilos.mejor}>
          <span className={estilos.subtitulo}>El entrevistador seguiría con</span>
          <p>{r.repregunta}</p>
          {alSeguir && (
            <button type="button" className="boton" onClick={alSeguir}>
              Responder la repregunta
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResultadoIngles({ r }) {
  return (
    <div className={estilos.resultado}>
      <div className={estilos.puntaje} data-veredicto={r.puntaje >= 8 ? "sabia" : r.puntaje >= 5 ? "dude" : "no"}>
        <strong>{r.puntaje}/10</strong>
        <span>Tu respuesta muestra un nivel {r.nivel}</span>
      </div>
      {r.comentario && <p>{r.comentario}</p>}
      {r.correcciones.length > 0 ? (
        <ul className={estilos.correcciones}>
          {r.correcciones.map((c, i) => (
            <li key={i}>
              <span lang="en">
                <del>{c.original}</del> → <ins>{c.corregido}</ins>
              </span>
              {c.explicacion && <small>{c.explicacion}</small>}
            </li>
          ))}
        </ul>
      ) : (
        <p className={estilos.suave}>Sin errores que corregir.</p>
      )}
      {r.version && (
        <div className={estilos.mejor}>
          <span className={estilos.subtitulo}>Como lo diría alguien con nivel C1</span>
          <p lang="en">{r.version}</p>
          {hayVoz() && (
            <button type="button" className={estilos.enlace} onClick={() => hablar(r.version)}>
              <IconoAudio tamano={15} /> Escuchar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
