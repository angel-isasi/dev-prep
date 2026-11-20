// Retos que crea la IA y no dependen de un ejercicio: "¿Qué imprime este código?" y "Code review al revés".
// En "¿Qué imprime?" la salida real la saca la app corriendo el código (lib/correr-js.js): la IA solo
// crea el código y explica, así nunca te corrige con una salida inventada.
import { useState } from "react";
import { correrJs } from "../../lib/correr-js.js";
import { TextoConCodigo } from "../TextoConCodigo.jsx";
import { CajaIa, CodigoIa, ListaIa, Veredicto, estilosIa as base } from "./CajaIa.jsx";
import { useIa } from "./useIa.js";
import { CrearTarjeta } from "./CrearTarjeta.jsx";
import estilos from "./Ia.module.css";

const TEMAS_IMPRIME = ["closures", "hoisting", "var, let y const en bucles", "this", "event loop y setTimeout", "promesas y async/await", "coerción de tipos", "referencias de objetos y arrays", "sorpréndeme"];
const TEMAS_REVIEW = ["métodos de array", "objetos y copias", "async/await y fetch", "DOM y eventos", "validación de formularios", "un componente de React", "sorpréndeme"];

/** Recuerda los últimos temas/conceptos para que la IA no repita. */
function useRecientes(clave) {
  const leer = () => {
    try {
      return JSON.parse(localStorage.getItem(clave) ?? "[]");
    } catch {
      return [];
    }
  };
  return {
    leer,
    sumar: (valor) => localStorage.setItem(clave, JSON.stringify([...leer(), valor].slice(-8))),
  };
}

function Temas({ temas, activo, alElegir }) {
  return (
    <div className={estilos.chips} role="radiogroup" aria-label="Tema">
      {temas.map((t) => (
        <button key={t} type="button" className={estilos.chip} data-activo={t === activo} aria-pressed={t === activo} onClick={() => alElegir(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

const elegirTema = (tema, temas) => (tema === "sorpréndeme" ? temas[Math.floor(Math.random() * (temas.length - 1))] : tema);

// ---------------------------------------------------------------------------------------------
export function QueImprime() {
  return (
    <CajaIa titulo="¿Qué imprime este código?" detalle="La pregunta trampa más común en entrevistas de JavaScript. Predice la salida y explica por qué.">
      {(olvidar) => <QueImprimeContenido olvidar={olvidar} />}
    </CajaIa>
  );
}

function QueImprimeContenido({ olvidar }) {
  const { cargando, error, pedir, setError } = useIa(olvidar);
  const recientes = useRecientes("devprep.imprimeRecientes");
  const [tema, setTema] = useState("sorpréndeme");
  const [reto, setReto] = useState(null); // { codigo, concepto, salida }
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);

  async function crear() {
    setR(null);
    setTexto("");
    const nuevo = await pedir({ tarea: "imprime-crear", tema: elegirTema(tema, TEMAS_IMPRIME), anteriores: recientes.leer() });
    if (!nuevo) return;
    try {
      const salida = await correrJs(nuevo.codigo);
      if (!salida.trim()) throw new Error("El código no imprimió nada. Pide otro.");
      recientes.sumar(nuevo.concepto);
      setReto({ ...nuevo, salida });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <Temas temas={TEMAS_IMPRIME} activo={tema} alElegir={setTema} />
      {reto && (
        <>
          <CodigoIa codigo={reto.codigo} />
          {!r ? (
            <>
              <textarea
                className={base.texto}
                rows={3}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Imprime... porque..."
              />
              <div className={base.fila}>
                <button
                  type="button"
                  className="boton boton-primario"
                  disabled={cargando || texto.trim().length < 2}
                  onClick={async () => setR(await pedir({ tarea: "imprime-evaluar", codigo: reto.codigo, salida: reto.salida, respuesta: texto }))}
                >
                  {cargando ? "Revisando…" : "Comprobar"}
                </button>
              </div>
            </>
          ) : (
            <div className={base.resultado}>
              <Veredicto valor={r.veredicto} texto={{ acerto: "¡Correcto!", casi: "Casi", no: "No era eso" }[r.veredicto]} />
              <span className={base.subtitulo}>Lo que imprime de verdad</span>
              <pre className={estilos.salida}>{reto.salida}</pre>
              <p>
                <TextoConCodigo>{r.explicacion}</TextoConCodigo>
              </p>
              {r.comentario && (
                <p className={estilos.nota}>
                  <TextoConCodigo>{r.comentario}</TextoConCodigo>
                </p>
              )}
              {r.veredicto !== "acerto" && (
                <CrearTarjeta origen="¿Qué imprime?" contenido={["Código:", reto.codigo, "Imprime:", reto.salida, "Por qué:", r.explicacion].join("\n")} />
              )}
            </div>
          )}
        </>
      )}
      <div className={base.fila}>
        <button type="button" className={reto ? "boton" : "boton boton-primario"} onClick={crear} disabled={cargando}>
          {cargando && !reto ? "Creando el código…" : reto ? "Otro código" : "Dame un código"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
export function ReviewAlReves() {
  return (
    <CajaIa titulo="Code review al revés" detalle="Un compañero abrió un pull request. Revísalo como un senior: qué cambiarías y por qué.">
      {(olvidar) => <ReviewContenido olvidar={olvidar} />}
    </CajaIa>
  );
}

function ReviewContenido({ olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const recientes = useRecientes("devprep.reviewRecientes");
  const [tema, setTema] = useState("sorpréndeme");
  const [pr, setPr] = useState(null);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);

  async function crear() {
    setR(null);
    setTexto("");
    const elegido = elegirTema(tema, TEMAS_REVIEW);
    const nuevo = await pedir({ tarea: "review-crear", tema: elegido, anteriores: recientes.leer() });
    if (!nuevo) return;
    recientes.sumar(nuevo.contexto);
    setPr(nuevo);
  }

  return (
    <>
      <Temas temas={TEMAS_REVIEW} activo={tema} alElegir={setTema} />
      {pr && (
        <>
          <p className={estilos.nota}>
            <strong>Ticket:</strong> {pr.contexto}
          </p>
          <CodigoIa codigo={pr.codigo} />
          {!r ? (
            <>
              <textarea
                className={base.texto}
                rows={5}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Línea 4: ... porque ... Sugiero ..."
              />
              <div className={base.fila}>
                <button
                  type="button"
                  className="boton boton-primario"
                  disabled={cargando || texto.trim().split(/\s+/).length < 4}
                  onClick={async () => setR(await pedir({ tarea: "review-evaluar", codigo: pr.codigo, problemas: pr.problemas, respuesta: texto }))}
                >
                  {cargando ? "Revisando tu revisión…" : "Enviar revisión"}
                </button>
              </div>
            </>
          ) : (
            <div className={base.resultado}>
              <Veredicto puntaje={r.puntaje} texto={`Encontraste ${r.encontrados.length} de ${pr.problemas.length}`} />
              <div className={base.columnas}>
                <ListaIa titulo="Lo que viste" items={r.encontrados} tipo="bien" />
                <ListaIa titulo="Se te pasó" items={r.faltaron} tipo="falta" />
              </div>
              {r.comentario && <p className={estilos.nota}>{r.comentario}</p>}
              {r.faltaron.length > 0 && <CrearTarjeta origen="code review" contenido={`Problemas de código que no vi en una revisión: ${r.faltaron.join("; ")}`} />}
            </div>
          )}
        </>
      )}
      <div className={base.fila}>
        <button type="button" className={pr ? "boton" : "boton boton-primario"} onClick={crear} disabled={cargando}>
          {cargando && !pr ? "Preparando el pull request…" : pr ? "Otro pull request" : "Dame un pull request"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}
