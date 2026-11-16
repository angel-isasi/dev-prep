import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Markdown } from "./Markdown.jsx";
import quiz from "./Quiz.module.css";
import estilos from "./PreguntaAncla.module.css";

/**
 * Pregunta ancla: al llegar al final de la teoría (o al tocar "Ya leí") aparece una pregunta
 * corta del quiz del tema. Si se te fue la mente mientras leías, te das cuenta enseguida y
 * relees solo esa parte. No cuenta como quiz ni guarda nada: es un control rápido.
 * @param {{ preguntas: object[], alSeguir: () => void }} props  preguntas: las del quiz del tema
 */
export function PreguntaAncla({ preguntas = [], alSeguir }) {
  const [visible, setVisible] = useState(false);
  const [elegida, setElegida] = useState(null);
  const [vuelta, setVuelta] = useState(0); // cambia la pregunta al pedir otra
  const final = useRef(null);
  const p = useMemo(() => (preguntas.length ? preguntas[Math.floor(Math.random() * preguntas.length)] : null), [preguntas, vuelta]);

  // Aparece sola cuando el final de la teoría entra en pantalla
  useEffect(() => {
    if (!p || visible || !final.current) return;
    const observador = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.6 });
    observador.observe(final.current);
    return () => observador.disconnect();
  }, [p, visible]);

  const seguir = (
    <button type="button" className="boton boton-primario" onClick={alSeguir}>
      Practicar con los ejercicios →
    </button>
  );

  if (!p) return <div className={estilos.seguir}>{seguir}</div>;

  const respondida = elegida !== null;
  const bien = elegida === p.correcta;

  return (
    <div ref={final} className={estilos.ancla}>
      {!visible ? (
        <div className={estilos.listo}>
          <span>¿Terminaste de leer?</span>
          <button type="button" className="boton" onClick={() => setVisible(true)}>
            Ya leí
          </button>
        </div>
      ) : (
        <motion.div
          className={estilos.tarjeta}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
        >
          <span className={estilos.etiqueta}>Pregunta ancla · ¿Te quedó?</span>
          <div className={quiz.pregunta}>
            <Markdown>{p.pregunta}</Markdown>
          </div>
          <div className={quiz.opciones}>
            {p.opciones.map((op, i) => (
              <button
                key={i}
                type="button"
                className={quiz.opcion}
                data-estado={respondida && i === p.correcta ? "correcta" : respondida && i === elegida ? "incorrecta" : ""}
                disabled={respondida}
                onClick={() => setElegida(i)}
              >
                <span className={quiz.letra}>{"ABCD"[i]}</span>
                <Markdown>{op}</Markdown>
              </button>
            ))}
          </div>
          {respondida && (
            <motion.div className={quiz.explicacion} data-ok={bien} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <strong>{bien ? "Te quedó. Sigue así." : "Se te escapó. Vuelve a leer la parte de esta pregunta antes de seguir."}</strong>
              <Markdown>{p.explicacion}</Markdown>
              <div className={estilos.acciones}>
                {seguir}
                <button
                  type="button"
                  className="boton boton-fantasma"
                  onClick={() => {
                    setElegida(null);
                    setVuelta((v) => v + 1);
                  }}
                >
                  Otra pregunta
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
