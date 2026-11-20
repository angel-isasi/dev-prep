// IA en Aprender: "Explícamelo distinto" (otra explicación de la teoría), "Explícalo en 30 segundos"
// (lo dices en voz alta y la IA lo evalúa) y el quiz nuevo con lo que fallaste.
import { useEffect, useRef, useState } from "react";
import { dictar, microDisponible } from "../../lib/voz.js";
import { Quiz } from "../Quiz.jsx";
import { IconoMicrofono } from "../Iconos.jsx";
import { CajaIa, CodigoIa, ListaIa, Veredicto, estilosIa as base } from "./CajaIa.jsx";
import { CrearTarjeta } from "./CrearTarjeta.jsx";
import { useIa } from "./useIa.js";
import estilos from "./Ia.module.css";

/** Las dos cajas de la pestaña Teoría, lado a lado. */
export function AprenderIa({ tema, teoria }) {
  return (
    <div className={estilos.rejilla}>
      <ExplicameDistinto tema={tema} teoria={teoria} />
      <Explicalo30 tema={tema} />
    </div>
  );
}

export function ExplicameDistinto({ tema, teoria }) {
  return (
    <CajaIa titulo="Explícamelo distinto" detalle="¿Algo no te quedó claro? Dime qué parte y te lo explico de otra forma.">
      {(olvidar) => <ExplicameContenido tema={tema} teoria={teoria} olvidar={olvidar} />}
    </CajaIa>
  );
}

function ExplicameContenido({ tema, teoria, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [duda, setDuda] = useState("");
  const [r, setR] = useState(null);
  return (
    <>
      <textarea className={base.texto} rows={2} value={duda} onChange={(e) => setDuda(e.target.value)} placeholder="Por ejemplo: no entiendo por qué el closure recuerda la variable (opcional)" />
      <div className={base.fila}>
        <button type="button" className="boton boton-primario" disabled={cargando} onClick={async () => setR(await pedir({ tarea: "explicar-distinto", tema, teoria, duda }))}>
          {cargando ? "Pensando otra forma…" : r ? "Otra explicación" : "Explícamelo"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
      {r && (
        <div className={base.resultado}>
          <p>{r.explicacion}</p>
          {r.analogia && <p className={estilos.nota}>{r.analogia}</p>}
          {r.ejemplo && <CodigoIa codigo={r.ejemplo} />}
          {r.pregunta && (
            <p>
              <strong>Compruébalo:</strong> {r.pregunta}
            </p>
          )}
          <CrearTarjeta origen={`Aprender: ${tema}`} contenido={`${tema}: ${r.explicacion}\n${r.ejemplo}`} />
        </div>
      )}
    </>
  );
}

const SEGUNDOS = 30;

export function Explicalo30({ tema }) {
  return (
    <CajaIa titulo="Explícalo en 30 segundos" detalle={`Como en la entrevista: "¿qué es ${tema}?". Dilo en voz alta y te digo cómo sonó.`}>
      {(olvidar) => <Explicalo30Contenido tema={tema} olvidar={olvidar} />}
    </CajaIa>
  );
}

function Explicalo30Contenido({ tema, olvidar }) {
  const { cargando, error, pedir, setError } = useIa(olvidar);
  const [texto, setTexto] = useState("");
  const [inicio, setInicio] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  const [r, setR] = useState(null);
  const dictado = useRef(null);
  const hayMicro = microDisponible();
  const restantes = inicio ? Math.max(0, SEGUNDOS - Math.floor((ahora - inicio) / 1000)) : null;

  useEffect(() => {
    if (!inicio) return;
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [inicio]);
  useEffect(() => {
    if (inicio && restantes === 0) detener();
  });
  useEffect(() => () => dictado.current?.detener(), []);

  function empezar() {
    setTexto("");
    setR(null);
    setError(null);
    setInicio(Date.now());
    setAhora(Date.now());
    if (hayMicro) {
      dictado.current = dictar({
        lang: "es-PE",
        alTexto: (t) => setTexto((p) => (p ? `${p} ${t}` : t)),
        alTerminar: (e) => e && setError(e.message),
      });
    }
  }
  function detener() {
    dictado.current?.detener();
    dictado.current = null;
    setInicio(null);
  }

  if (r) {
    return (
      <div className={base.resultado}>
        <Veredicto puntaje={r.puntaje} texto="Así sonó tu explicación" />
        <div className={base.columnas}>
          <ListaIa titulo="Bien" items={r.bien} tipo="bien" />
          <ListaIa titulo="Te faltó" items={r.falta} tipo="falta" />
        </div>
        {r.mejor && (
          <div className={base.mejor}>
            <span className={base.subtitulo}>Así lo dirías en 30 segundos</span>
            <p>{r.mejor}</p>
          </div>
        )}
        <button type="button" className="boton" onClick={empezar}>
          Otra vez
        </button>
      </div>
    );
  }

  return (
    <>
      {inicio ? (
        <div className={base.fila}>
          <strong style={{ fontSize: "var(--letra-5)" }}>0:{String(restantes).padStart(2, "0")}</strong>
          <button type="button" className="boton boton-primario" onClick={detener}>
            Terminé
          </button>
        </div>
      ) : (
        <div className={base.fila}>
          <button type="button" className="boton boton-primario" onClick={empezar}>
            {hayMicro && <IconoMicrofono tamano={16} />} {texto ? "Empezar de nuevo" : "Empezar"}
          </button>
          {!hayMicro && <small className={base.suave}>Sin micrófono: escríbelo en 30 segundos.</small>}
        </div>
      )}
      {(inicio || texto) && (
        <textarea className={base.texto} rows={4} value={texto} readOnly={hayMicro && !!inicio} onChange={(e) => setTexto(e.target.value)} placeholder={hayMicro ? "Lo que dices aparece aquí…" : "Escribe tu explicación…"} />
      )}
      {!inicio && texto && (
        <div className={base.fila}>
          <button type="button" className="boton boton-primario" disabled={cargando} onClick={async () => setR(await pedir({ tarea: "explicar-concepto", tema, respuesta: texto }))}>
            {cargando ? "Escuchando…" : "Evaluar"}
          </button>
        </div>
      )}
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}

/** Al terminar un quiz con fallos: un quiz nuevo, hecho por la IA, con esos mismos conceptos. */
export function QuizFallos({ tema, fallos }) {
  return (
    <CajaIa titulo="Quiz de lo que fallaste" detalle="Preguntas nuevas sobre los mismos conceptos, para comprobar que ya lo entendiste." vacio={null}>
      {(olvidar) => <QuizFallosContenido tema={tema} fallos={fallos} olvidar={olvidar} />}
    </CajaIa>
  );
}

function QuizFallosContenido({ tema, fallos, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [preguntas, setPreguntas] = useState(null);
  const [fin, setFin] = useState(null);
  if (preguntas) {
    return (
      <>
        <Quiz preguntas={preguntas} alTerminar={(aciertos) => setFin(aciertos)} />
        {fin !== null && fin < preguntas.length && (
          <CrearTarjeta origen={`quiz de ${tema}`} contenido={fallos.map((f) => `${f.pregunta}\nRespuesta: ${f.correcta}. ${f.explicacion}`).join("\n\n")} texto="+ Tarjetas de estos conceptos" />
        )}
      </>
    );
  }
  return (
    <>
      <div className={base.fila}>
        <button
          type="button"
          className="boton boton-primario"
          disabled={cargando}
          onClick={async () => {
            const r = await pedir({ tarea: "quiz-fallos", tema, fallos });
            const validas = (r?.preguntas ?? [])
              .filter((p) => p.opciones?.length >= 2 && p.pregunta)
              .map((p) => ({ ...p, correcta: Math.min(p.correcta, p.opciones.length - 1) }));
            if (validas.length) setPreguntas(validas);
          }}
        >
          {cargando ? "Armando preguntas nuevas…" : `Quiz nuevo de ${fallos.length} ${fallos.length === 1 ? "concepto" : "conceptos"}`}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}
