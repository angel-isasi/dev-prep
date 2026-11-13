import { useState } from "react";
import { motion } from "motion/react";
import { Markdown } from "./Markdown.jsx";
import estilos from "./Tarjeta.module.css";

const NOTAS = [
  { valor: "no", texto: "No lo sabía", tipo: "error" },
  { valor: "dude", texto: "Dudé", tipo: "aviso" },
  { valor: "sabia", texto: "Lo sabía", tipo: "exito" },
];

/**
 * Una tarjeta de entrevista: piensas tu respuesta, la revelas y te calificas.
 * @param {{ pregunta: object, alCalificar: (nota: string) => void, posicion?: string }} props
 */
export function Tarjeta({ pregunta, alCalificar, posicion }) {
  const [revelada, setRevelada] = useState(false);
  const [ingles, setIngles] = useState(false);

  return (
    <motion.article
      className={estilos.tarjeta}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <header className={estilos.cabecera}>
        <span className={estilos.categoria}>{pregunta.categoria}</span>
        <div className={estilos.herramientas}>
          {posicion && <span className={estilos.posicion}>{posicion}</span>}
          <button type="button" className={estilos.idioma} onClick={() => setIngles((v) => !v)}>
            {ingles ? "ES" : "EN"}
          </button>
        </div>
      </header>

      <h2 className={estilos.pregunta}>
        <Markdown>{ingles && pregunta.preguntaEn ? pregunta.preguntaEn : pregunta.pregunta}</Markdown>
      </h2>

      {!revelada ? (
        <div className={estilos.pensar}>
          <p>
            Responde <strong>en voz alta</strong>, como si estuvieras frente al entrevistador. Cuando termines,
            revela la respuesta modelo y sé honesto contigo.
          </p>
          <button type="button" className="boton boton-primario" onClick={() => setRevelada(true)}>
            Revelar respuesta
          </button>
        </div>
      ) : (
        <motion.div
          className={estilos.revelado}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={estilos.respuesta}>
            <span className={estilos.etiqueta}>{ingles ? "Say this" : "Di esto"}</span>
            <Markdown>{ingles && pregunta.respuestaEn ? pregunta.respuestaEn : pregunta.respuesta}</Markdown>
          </div>

          {pregunta.claves?.length > 0 && (
            <div className={estilos.claves}>
              <span className={estilos.etiqueta}>Lo que el entrevistador quiere escuchar</span>
              <ul>
                {pregunta.claves.map((c, i) => (
                  <li key={i}>
                    <Markdown>{c}</Markdown>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={estilos.notas}>
            <span>¿Cómo te fue?</span>
            {NOTAS.map((n) => (
              <button
                key={n.valor}
                type="button"
                className={`boton ${estilos.nota}`}
                data-tipo={n.tipo}
                onClick={() => alCalificar(n.valor)}
              >
                {n.texto}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}
