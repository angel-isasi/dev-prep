// El balance de una entrevista completa (simulacro o entrevista por voz), escrito por la IA:
// una nota general, qué tan cerca estás, tus fortalezas, qué mejorar y un plan de pocos pasos.
import { useEffect, useRef, useState } from "react";
import { pedirIa } from "../lib/ia.js";
import { contextoPersonal, PuertaIa, UsoIa } from "./EvaluadorIa.jsx";
import estilos from "./EvaluadorIa.module.css";

const NIVELES = {
  listo: { texto: "Hoy pasarías una entrevista junior", color: "sabia" },
  casi: { texto: "Estás cerca: te faltan cosas puntuales", color: "dude" },
  falta: { texto: "Todavía no: hay que reforzar la base", color: "no" },
};

/** Un item sirve para el informe si tiene pregunta y alguna señal de cómo te fue. */
export const itemsValidos = (items) => items.filter((i) => i.pregunta && (i.nota || i.respuesta || Number.isFinite(i.puntaje)));

/**
 * @param {object} props
 * @param {object[]} props.items       [{ etapa, pregunta, nota, puntaje, falta, respuesta }] (ver server/ia.js)
 * @param {string} [props.notas]       lo que anotaste sobre cómo te fue
 * @param {"es"|"en"} [props.idioma]
 * @param {boolean} [props.voz]        la entrevista fue hablada
 * @param {object|null} props.informe  el informe ya pedido (lo guarda quien usa el componente)
 * @param {(informe: object) => void} props.alInforme
 * @param {boolean} [props.automatico] pedirlo solo al aparecer (entrevista por voz)
 */
export function InformeIa(props) {
  if (props.informe) return <VistaInforme informe={props.informe} />;
  if (itemsValidos(props.items).length < 2) {
    return <p className={estilos.suave}>El informe con IA necesita al menos 2 preguntas respondidas.</p>;
  }
  return <PuertaIa>{() => <Pedir {...props} />}</PuertaIa>;
}

function Pedir({ items, notas, idioma, voz, alInforme, automatico }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const pedido = useRef(false);

  async function pedir() {
    setCargando(true);
    setError(null);
    try {
      alInforme(await pedirIa({ tarea: "informe", items: itemsValidos(items), notas, idioma, voz, contexto: await contextoPersonal() }));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!automatico || pedido.current) return;
    pedido.current = true;
    pedir();
  }, []);

  return (
    <div className={estilos.caja}>
      <span className={estilos.etiqueta}>Informe del entrevistador</span>
      <p className={estilos.suave}>La IA mira toda la entrevista junta: busca lo que se repite y te deja un plan corto.</p>
      <div className={estilos.fila}>
        <button type="button" className="boton boton-primario" onClick={pedir} disabled={cargando}>
          {cargando ? "Escribiendo tu informe… (unos segundos)" : error ? "Reintentar" : "Pedir mi informe"}
        </button>
      </div>
      {error && <p className={estilos.error}>{error}</p>}
      <UsoIa />
    </div>
  );
}

function VistaInforme({ informe: r }) {
  const nivel = NIVELES[r.nivel] ?? NIVELES.casi;
  return (
    <div className={estilos.caja}>
      <span className={estilos.etiqueta}>Informe del entrevistador</span>
      <div className={estilos.resultado}>
        <div className={estilos.puntaje} data-veredicto={nivel.color}>
          <strong>{r.puntaje}/10</strong>
          <span>{nivel.texto}</span>
        </div>
        {r.resumen && <p>{r.resumen}</p>}
        <div className={estilos.columnas}>
          {r.fortalezas?.length > 0 && (
            <div>
              <span className={estilos.subtitulo} data-tipo="bien">
                Tus fortalezas
              </span>
              <ul>
                {r.fortalezas.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          {r.mejoras?.length > 0 && (
            <div>
              <span className={estilos.subtitulo} data-tipo="falta">
                Lo que más te pesaría
              </span>
              <ul>
                {r.mejoras.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {r.plan?.length > 0 && (
          <div className={estilos.mejor}>
            <span className={estilos.subtitulo}>Tu plan para los próximos días</span>
            <ol className={estilos.pasos}>
              {r.plan.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
