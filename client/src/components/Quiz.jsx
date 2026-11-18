import { useState } from "react";
import { motion } from "motion/react";
import { Markdown } from "./Markdown.jsx";
import { feedback } from "../lib/feedback.js";
import estilos from "./Quiz.module.css";

/**
 * Quiz de opción múltiple: eliges, ves si acertaste y por qué, y sigues.
 * @param {{ preguntas: { pregunta: string, opciones: string[], correcta: number, explicacion: string }[], alTerminar: (aciertos: number) => void, mejor?: number }} props
 */
export function Quiz({ preguntas, alTerminar, mejor }) {
  const [indice, setIndice] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  if (terminado) {
    const todo = aciertos === preguntas.length;
    return (
      <div className={estilos.final}>
        <strong className={estilos.puntaje} data-ok={todo}>
          {aciertos}/{preguntas.length}
        </strong>
        <p>
          {todo
            ? "Perfecto. Dominas este tema."
            : aciertos >= preguntas.length * 0.6
              ? "Bien. Repasa en la teoría las que fallaste y vuelve a intentarlo."
              : "Te conviene releer la teoría y hacer los ejercicios antes de repetirlo."}
        </p>
        <button
          type="button"
          className="boton"
          onClick={() => {
            setIndice(0);
            setElegida(null);
            setAciertos(0);
            setTerminado(false);
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const p = preguntas[indice];
  const respondida = elegida !== null;

  function elegir(i) {
    if (respondida) return;
    setElegida(i);
    if (i === p.correcta) {
      setAciertos((a) => a + 1);
      feedback.acierto();
    } else feedback.fallo();
  }

  function siguiente() {
    if (indice + 1 >= preguntas.length) {
      setTerminado(true);
      // Quiz perfecto: se celebra como una lección
      if (aciertos === preguntas.length) feedback.logro("leccion");
      alTerminar(aciertos);
    } else {
      setIndice(indice + 1);
      setElegida(null);
    }
  }

  return (
    <div className={estilos.quiz}>
      <div className={estilos.cabecera}>
        <span>
          Pregunta {indice + 1} de {preguntas.length}
        </span>
        {mejor != null && <span>Tu mejor puntaje: {mejor}</span>}
      </div>
      <div className={estilos.pregunta}>
        <Markdown>{p.pregunta}</Markdown>
      </div>
      <div className={estilos.opciones}>
        {p.opciones.map((op, i) => {
          let estado = "";
          if (respondida && i === p.correcta) estado = "correcta";
          else if (respondida && i === elegida) estado = "incorrecta";
          return (
            <button
              key={i}
              type="button"
              className={estilos.opcion}
              data-estado={estado}
              disabled={respondida}
              onClick={() => elegir(i)}
            >
              <span className={estilos.letra}>{"ABCD"[i]}</span>
              <Markdown>{op}</Markdown>
            </button>
          );
        })}
      </div>
      {respondida && (
        <motion.div
          className={estilos.explicacion}
          data-ok={elegida === p.correcta}
          initial={{ opacity: 0, y: 8 }}
          animate={elegida === p.correcta ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, x: [0, -6, 6, -3, 3, 0] }}
          transition={{ duration: 0.35 }}
        >
          <strong>{elegida === p.correcta ? "¡Correcto!" : "No es esa."}</strong>
          <Markdown>{p.explicacion}</Markdown>
          <button type="button" className="boton boton-primario" onClick={siguiente}>
            {indice + 1 >= preguntas.length ? "Ver resultado" : "Siguiente"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
