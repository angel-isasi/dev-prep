// "Evaluar con IA": escribes o dictas tu respuesta y la IA te dice qué estuvo bien, qué faltó, cómo
// decirlo mejor y te hace una repregunta (entrevistas); o te corrige el inglés (mapache).
// Habla con la función de Vercel (lib/ia.js). Si la IA no está configurada, solo muestra un aviso.
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { claveIa, estadoIa, guardarClaveIa, guardarTopeIa, pedirIa, quienSoyIa, registroIa, topeIa, usoIa } from "../lib/ia.js";
import { dictar, hablar, hayVoz, microDisponible } from "../lib/voz.js";
import { IconoAudio, IconoChispa, IconoMicrofono } from "./Iconos.jsx";
import { TextoConCodigo } from "./TextoConCodigo.jsx";
import { CrearTarjeta } from "./ia/CrearTarjeta.jsx";
import { guardarErroresIngles } from "../lib/errores-ingles.js";
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
    return [mis.pitch?.trim() ? `Pitch: ${mis.pitch.trim()}` : "", historias.length ? `Historias:\n${historias.join("\n")}` : ""]
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return "";
  }
}

/**
 * La puerta de todo lo que usa IA: mientras no esté configurada en Vercel muestra un aviso, y si falta
 * tu contraseña la pide. Cuando todo está listo dibuja lo de adentro.
 * `vacio` (opcional) reemplaza el aviso de "IA apagada" por otro contenido.
 * @param {{ children: (olvidarClave: () => void) => import("react").ReactNode, vacio?: import("react").ReactNode }} props
 */
export function PuertaIa({ children, vacio }) {
  const [listo, setListo] = useState(null); // null: averiguando
  const [clave, setClave] = useState(claveIa);

  useEffect(() => {
    estadoIa().then((e) => setListo(e.configurada));
  }, []);

  if (listo === null) return null;
  if (!listo) {
    if (vacio !== undefined) return vacio;
    // Una cajita de una línea: cabe dentro de una tarjeta chica y no se ve perdida sola en una pestaña
    return (
      <p className={estilos.apagado} role="note">
        <span className={estilos.apagadoIcono} aria-hidden>
          <IconoChispa tamano={16} />
        </span>
        <span>
          <strong>IA apagada</strong>
          <span>
            Falta la API key en Vercel. Pasos en <code>docs/ia.md</code>.
          </span>
        </span>
      </p>
    );
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
        {/* Sirve tu contraseña o el código de invitado: el servidor decide quién eres */}
        <p className={estilos.suave}>La IA es solo con invitación. Si tienes un código de acceso, escríbelo aquí: se guarda solo en este navegador.</p>
        <div className={estilos.fila}>
          <input name="clave" type="password" autoComplete="off" aria-label="Código de acceso a la IA" placeholder="Código de acceso" className={estilos.entrada} />
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

/**
 * Cuánto llevas gastado este mes y tu tope (la cuenta vive en este navegador). Solo lo ve el dueño:
 * el invitado tiene su propio tope en la consola de la API y esta cuenta lo confundiría.
 */
export function UsoIa() {
  const [tope, setTope] = useState(topeIa);
  const [rol, setRol] = useState(null);
  useEffect(() => {
    let vivo = true;
    quienSoyIa().then((r) => vivo && setRol(r.rol));
    return () => {
      vivo = false;
    };
  }, []);
  if (rol !== "dueno") return null;
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
      <small>
        Al llegar al tope la app deja de pedir evaluaciones. La cuenta es de este navegador: el gasto exacto está en la consola de la API.
      </small>
      <RegistroIa />
    </details>
  );
}

const HORA = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** En qué se gastó: los últimos pedidos con su hora (de Perú), para qué fueron, el modelo y el costo. */
function RegistroIa() {
  const filas = registroIa().slice(0, 20);
  if (!filas.length) return <small>Todavía no hay pedidos anotados.</small>;
  return (
    <table className={estilos.registro}>
      <caption>Últimos pedidos</caption>
      <thead>
        <tr>
          <th>Cuándo</th>
          <th>Para qué</th>
          <th>Modelo</th>
          <th>USD</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f, i) => (
          <tr key={i}>
            <td>{HORA.format(new Date(f.fecha))}</td>
            <td>{f.tarea}</td>
            <td>{f.modelo}</td>
            <td>{f.usd.toFixed(3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * @param {object} props
 * @param {"entrevista"|"ingles"|"codigo"} props.tarea
 * @param {object} props.pedido          lo que se manda además de la respuesta (pregunta, claves, modelo, nivel...)
 * @param {string} [props.respuestaFija] si ya respondiste en otro lado (mapache): solo el botón para corregirla
 * @param {(resultado: object, respuesta: string) => void} [props.alResultado]
 * @param {"es"|"en"} [props.idioma]     idioma en que respondes (para el dictado)
 * @param {string} [props.textoBoton]     texto del botón de evaluar (por ejemplo "Evaluar mi pitch")
 * @param {string} [props.titulo]         título de la caja (si no, uno según la tarea)
 * @param {string} [props.detalle]        una línea de qué hacer, bajo el título
 */
export function EvaluadorIa(props) {
  return <PuertaIa>{(olvidarClave) => <Evaluador {...props} alOlvidarClave={olvidarClave} />}</PuertaIa>;
}

function Evaluador({ tarea, pedido, respuestaFija, alResultado, idioma = "es", textoBoton, titulo, detalle, alOlvidarClave }) {
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
      if (tarea === "ingles") guardarErroresIngles(r.correcciones, "Map");
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
    <div className={estilos.caja} data-caja-ia>
      <div className={estilos.cabecera} data-caja-titulo>
        <span className={estilos.etiqueta}>{repregunta ? "Repregunta" : titulo ? titulo : tarea === "ingles" ? "Corregir con IA" : tarea === "codigo" ? "Revisión de un senior" : repregunta ? "Repregunta" : "Evaluar con IA"}</span>
        <button type="button" className={estilos.enlace} onClick={alOlvidarClave}>
          Cambiar código
        </button>
      </div>
      {detalle && !repregunta && !resultado && (
        <p className={estilos.suave} data-caja-titulo>
          {detalle}
        </p>
      )}
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
                placeholder={
                  idioma === "en" ? "Write or dictate your answer..." : "Escribe o dicta tu respuesta, como la dirías en la entrevista..."
                }
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
              {cargando
                ? "Evaluando… (unos segundos)"
                : tarea === "ingles"
                  ? "Corregir mi inglés"
                  : tarea === "codigo"
                    ? "Revisar mi código"
                    : (textoBoton ?? "Evaluar mi respuesta")}
            </button>
          </div>
        </>
      )}

      {error && <p className={estilos.error}>{error}</p>}

      {resultado && tarea === "entrevista" && (
        <ResultadoEntrevista r={resultado} pregunta={preguntaActual} alSeguir={resultado.repregunta ? seguirConRepregunta : null} />
      )}
      {resultado && tarea === "ingles" && <ResultadoIngles r={resultado} />}
      {resultado && tarea === "codigo" && <ResultadoCodigo r={resultado} codigo={respuesta} />}
      {resultado && (
        <button type="button" className={estilos.enlace} onClick={() => setResultado(null)}>
          {respuestaFija === undefined ? "Intentar otra respuesta" : "Cerrar"}
        </button>
      )}
      <UsoIa />
    </div>
  );
}

function ResultadoEntrevista({ r, pregunta, alSeguir }) {
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
            <CrearTarjeta origen="entrevista" texto="+ Tarjeta de lo que te faltó" contenido={`Pregunta de entrevista: ${pregunta}
Lo que le faltó: ${r.falta.join("; ")}
Respuesta mejorada: ${r.mejor}`} />
          </div>
        )}
      </div>
      <div className={estilos.pareja}>
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
    </div>
  );
}

function ResultadoCodigo({ r, codigo }) {
  // Repregunta sobre tu código: eliges una pregunta del entrevistador y la respondes
  const [elegida, setElegida] = useState(null);
  return (
    <div className={estilos.resultado}>
      <div className={estilos.puntaje} data-veredicto={r.puntaje >= 8 ? "sabia" : r.puntaje >= 5 ? "dude" : "no"}>
        <strong>{r.puntaje}/10</strong>
        <span>Así lo vería un entrevistador</span>
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
        {r.mejoras.length > 0 && (
          <div>
            <span className={estilos.subtitulo} data-tipo="falta">
              Para subir de nivel
            </span>
            <ul>
              {r.mejoras.map((x, i) => (
                <li key={i}>
                  <TextoConCodigo>{x}</TextoConCodigo>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {r.preguntas.length > 0 && (
        <div className={estilos.mejor}>
          <span className={estilos.subtitulo}>Lo que te preguntaría el entrevistador</span>
          <ul>
            {r.preguntas.map((x, i) => (
              <li key={i}>
                {x}{" "}
                <button type="button" className={estilos.enlace} onClick={() => setElegida(x)}>
                  Responder
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {r.comparacion?.length > 0 && (
        <div className={estilos.mejor}>
          <span className={estilos.subtitulo}>Tu solución y la oficial</span>
          <ul>
            {r.comparacion.map((x, i) => (
              <li key={i}>
                <TextoConCodigo>{x}</TextoConCodigo>
              </li>
            ))}
          </ul>
        </div>
      )}
      {elegida && <EvaluadorIa key={elegida} tarea="entrevista" textoBoton="Evaluar mi respuesta" pedido={{ pregunta: elegida, categoria: "Preguntas sobre tu código", codigo }} />}
    </div>
  );
}

export function ResultadoIngles({ r }) {
  return (
    <div className={estilos.resultado}>
      <div className={estilos.puntaje} data-veredicto={r.puntaje >= 8 ? "sabia" : r.puntaje >= 5 ? "dude" : "no"}>
        <strong>{r.puntaje}/10</strong>
        <span>Tu respuesta muestra un nivel {r.nivel}</span>
      </div>
      {r.comentario && <p>{r.comentario}</p>}
      <div className={estilos.pareja}>
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
            <li>
              <CrearTarjeta origen="corrección de inglés" texto="+ Tarjetas de estos errores" contenido={r.correcciones.map((c) => `${c.original} → ${c.corregido} (${c.explicacion})`).join("\n")} />
            </li>
          </ul>
        ) : (
          <p className={estilos.suave}>Sin errores que corregir.</p>
        )}
        {r.version && (
          <div className={estilos.mejor}>
            <span className={estilos.subtitulo}>Así sonaría más natural</span>
            <p lang="en">{r.version}</p>
            {hayVoz() && (
              <button type="button" className={estilos.enlace} onClick={() => hablar(r.version)}>
                <IconoAudio tamano={15} /> Escuchar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
