// Charla por turnos con la IA (defiende tu proyecto, negociación de sueldo, reuniones en inglés).
// Cada turno es un pedido barato; al final, un balance con un modelo mejor.
import { useEffect, useRef, useState } from "react";
import { dictar, decir, hayVoz, microDisponible } from "../../lib/voz.js";
import { IconoAudio, IconoMicrofono } from "../Iconos.jsx";
import { ListaIa, Veredicto, estilosIa as base } from "./CajaIa.jsx";
import { useIa } from "./useIa.js";
import estilos from "./Ia.module.css";

/** El texto de un turno de la IA, venga como venga (respuesta, o comentario + pregunta). */
const textoDe = (r) => r?.respuesta ?? [r?.comentario, r?.pregunta].filter(Boolean).join(" ");

/** El balance por defecto: puntaje, bien, mejoras y frases para la próxima. */
export function Balance({ r }) {
  return (
    <div className={base.resultado}>
      <Veredicto puntaje={r.puntaje} texto="Tu balance" />
      {r.resumen && <p>{r.resumen}</p>}
      <div className={base.columnas}>
        <ListaIa titulo="Bien" items={r.bien} tipo="bien" />
        <ListaIa titulo="Para mejorar" items={r.mejoras} tipo="falta" />
      </div>
      {r.frases?.length > 0 && (
        <div className={base.mejor}>
          <span className={base.subtitulo}>Frases para la próxima</span>
          <ul>
            {r.frases.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * @param {object} p
 * @param {string} p.tareaTurno  tarea de cada turno (devuelve { respuesta | comentario+pregunta, fin })
 * @param {string} p.tareaCierre tarea del balance final
 * @param {object} p.datos       lo fijo de la charla ({ proyecto } o { escenario })
 * @param {string} p.textoEmpezar
 * @param {"es"|"en"} [p.idioma]
 * @param {(r: object) => import("react").ReactNode} [p.verCierre]  cómo mostrar el balance
 * @param {() => void} [p.alOlvidarClave]
 * @param {(r: object, historial: object[]) => void} [p.alCerrar]
 */
export function ChatIa({ tareaTurno, tareaCierre, datos, textoEmpezar = "Empezar", idioma = "es", verCierre, alOlvidarClave, alCerrar, nombreOtro = "Entrevistador" }) {
  const { cargando, error, pedir } = useIa(alOlvidarClave);
  const [historial, setHistorial] = useState([]);
  const [texto, setTexto] = useState("");
  const [fin, setFin] = useState(false);
  const [cierre, setCierre] = useState(null);
  const [dictando, setDictando] = useState(false);
  const [conVoz, setConVoz] = useState(false);
  const dictado = useRef(null);
  const abajo = useRef(null);
  useEffect(() => () => dictado.current?.detener(), []);
  useEffect(() => {
    abajo.current?.scrollIntoView?.({ block: "nearest" });
  }, [historial.length]);

  async function turno(nuevoHistorial) {
    const r = await pedir({ tarea: tareaTurno, ...datos, historial: nuevoHistorial });
    if (!r) return;
    const linea = textoDe(r);
    setHistorial([...nuevoHistorial, { de: "ia", texto: linea }]);
    if (r.fin) setFin(true);
    if (conVoz && hayVoz()) decir(linea, { idioma });
  }

  async function enviar() {
    dictado.current?.detener();
    if (!texto.trim()) return;
    const nuevo = [...historial, { de: "yo", texto: texto.trim() }];
    setHistorial(nuevo);
    setTexto("");
    await turno(nuevo);
  }

  async function cerrar() {
    const r = await pedir({ tarea: tareaCierre, ...datos, historial });
    if (r) {
      setCierre(r);
      alCerrar?.(r, historial);
    }
  }

  if (!historial.length) {
    return (
      <div className={base.fila}>
        <button type="button" className="boton boton-primario" disabled={cargando} onClick={() => turno([])}>
          {cargando ? "Preparando…" : textoEmpezar}
        </button>
        {hayVoz() && (
          <label className={base.suave}>
            <input type="checkbox" checked={conVoz} onChange={(e) => setConVoz(e.target.checked)} /> Leer en voz alta
          </label>
        )}
        {error && <p className={base.error}>{error}</p>}
      </div>
    );
  }

  return (
    <>
      <ol className={estilos.chat}>
        {historial.map((t, i) => (
          <li key={i} data-de={t.de} lang={idioma}>
            <small>{t.de === "yo" ? "Tú" : nombreOtro}</small>
            <span>{t.texto}</span>
            {t.de === "ia" && hayVoz() && (
              <button type="button" className={estilos.enlinea} onClick={() => decir(t.texto, { idioma })} aria-label="Escuchar">
                <IconoAudio tamano={14} />
              </button>
            )}
          </li>
        ))}
        <li ref={abajo} aria-hidden style={{ padding: 0, border: 0, background: "none" }} />
      </ol>
      {cierre ? (
        verCierre ? verCierre(cierre) : <Balance r={cierre} />
      ) : (
        <>
          {!fin && (
            <>
              <textarea
                className={base.texto}
                rows={3}
                lang={idioma}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.ctrlKey || e.metaKey) && enviar()}
                placeholder={idioma === "en" ? "Your answer… (Ctrl+Enter to send)" : "Tu respuesta… (Ctrl+Enter envía)"}
              />
              <div className={base.fila}>
                {microDisponible() && (
                  <button
                    type="button"
                    className="boton"
                    data-activo={dictando}
                    onClick={() => {
                      if (dictando) return dictado.current?.detener();
                      dictado.current = dictar({
                        lang: idioma === "en" ? "en-US" : "es-PE",
                        alTexto: (t) => setTexto((p) => (p ? `${p} ${t}` : t)),
                        alTerminar: () => setDictando(false),
                      });
                      setDictando(!!dictado.current);
                    }}
                  >
                    <IconoMicrofono tamano={16} /> {dictando ? "Detener" : "Dictar"}
                  </button>
                )}
                <button type="button" className="boton boton-primario" disabled={cargando || !texto.trim()} onClick={enviar}>
                  {cargando ? "…" : "Enviar"}
                </button>
              </div>
            </>
          )}
          {historial.filter((t) => t.de === "yo").length >= 2 && (
            <div className={base.fila}>
              <button type="button" className={fin ? "boton boton-primario" : "boton boton-fantasma"} disabled={cargando} onClick={cerrar}>
                {cargando ? "Preparando el balance…" : "Terminar y ver mi balance"}
              </button>
            </div>
          )}
        </>
      )}
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}
