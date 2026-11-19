import { useState } from "react";
import { Grabadora } from "./Grabadora.jsx";
import { EvaluadorIa } from "./EvaluadorIa.jsx";
import { hablar, hayVoz } from "../lib/voz.js";

// El idioma que elegiste la última vez (para practicar las entrevistas en inglés)
const CLAVE_IDIOMA = "devprep-tarjetas-en";
import { motion } from "motion/react";
import { Markdown } from "./Markdown.jsx";
import estilos from "./Tarjeta.module.css";
import { IconoAudio } from "./Iconos.jsx";

const NOTAS = [
  { valor: "no", texto: "No lo sabía", tipo: "error" },
  { valor: "dude", texto: "Dudé", tipo: "aviso" },
  { valor: "sabia", texto: "Lo sabía", tipo: "exito" },
];

/**
 * Una tarjeta de entrevista: piensas tu respuesta, la revelas y te calificas.
 * @param {{ pregunta: object, alCalificar: (nota: string) => void, posicion?: string }} props
 */
/**
 * @param {{ pregunta: object, alCalificar: Function, posicion?: string, grabar?: boolean, enIngles?: boolean }} props
 *   grabar: muestra la grabadora para responder en voz alta y escucharte (simulacro, inglés).
 */
export function Tarjeta({ pregunta, alCalificar, posicion, grabar = false, enIngles, alEvaluar }) {
  const [revelada, setRevelada] = useState(false);
  const [sugerida, setSugerida] = useState(null); // la nota que sugiere la IA, si la usaste
  const [ingles, setInglesEstado] = useState(() => enIngles ?? localStorage.getItem(CLAVE_IDIOMA) === "1");
  const setIngles = (cambiar) =>
    setInglesEstado((v) => {
      const nuevo = typeof cambiar === "function" ? cambiar(v) : cambiar;
      localStorage.setItem(CLAVE_IDIOMA, nuevo ? "1" : "0");
      return nuevo;
    });

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
          {ingles && pregunta.preguntaEn && hayVoz() && (
            <button type="button" className={estilos.idioma} onClick={() => hablar(pregunta.preguntaEn)} aria-label="Escuchar la pregunta en inglés">
              <IconoAudio tamano={16} />
            </button>
          )}
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
          {grabar && <Grabadora clave={`tarjeta:${pregunta.id}`} texto={ingles ? "Record my answer" : "Grabar mi respuesta"} />}
          <EvaluadorIa
            key={`${pregunta.id}-${ingles}`}
            tarea="entrevista"
            idioma={ingles ? "en" : "es"}
            pedido={{
              pregunta: ingles && pregunta.preguntaEn ? pregunta.preguntaEn : pregunta.pregunta,
              claves: pregunta.claves ?? [],
              modelo: ingles && pregunta.respuestaEn ? pregunta.respuestaEn : pregunta.respuesta,
              categoria: pregunta.categoria,
              idioma: ingles ? "en" : "es",
            }}
            alResultado={(r, respuesta) => {
              setSugerida(r.veredicto);
              alEvaluar?.(r, respuesta);
            }}
          />
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
            <span>{sugerida ? "¿Cómo te fue? (la IA sugiere la marcada)" : "¿Cómo te fue?"}</span>
            {NOTAS.map((n) => (
              <button
                key={n.valor}
                type="button"
                className={`boton ${estilos.nota}`}
                data-tipo={n.tipo}
                data-sugerida={sugerida === n.valor}
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
