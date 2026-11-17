// Preguntas de entrevista en tarjetas: lees la pregunta, la respondes en voz alta y luego revelas
// la respuesta modelo para comparar. Se usa en la teoría de Aprender y en Chuletas.
import { useState } from "react";
import { Markdown } from "./Markdown.jsx";
import { EnLinea } from "./EnLinea.jsx";
import estilos from "./PreguntasEntrevista.module.css";

export function PreguntasEntrevista({ preguntas, columnas = 400 }) {
  const [abiertas, setAbiertas] = useState(() => new Set());
  const todas = abiertas.size === preguntas.length;

  function alternar(i) {
    setAbiertas((previo) => {
      const nuevo = new Set(previo);
      nuevo.has(i) ? nuevo.delete(i) : nuevo.add(i);
      return nuevo;
    });
  }

  return (
    <div className={estilos.bloque}>
      <div className={estilos.barra}>
        <p>Responde en voz alta como si te lo preguntaran, y luego compara.</p>
        <button type="button" className={estilos.boton} onClick={() => setAbiertas(todas ? new Set() : new Set(preguntas.map((_, i) => i)))}>
          {todas ? "Ocultar respuestas" : "Ver todas las respuestas"}
        </button>
      </div>
      <div className={estilos.preguntas} style={{ "--columna": `${columnas}px` }}>
        {preguntas.map((p, i) => (
          <div key={i} className={estilos.pregunta} data-abierta={abiertas.has(i)}>
            <strong>
              <EnLinea texto={p.titulo} />
            </strong>
            {abiertas.has(i) ? (
              <>
                <Markdown>{p.cuerpo}</Markdown>
                <button type="button" className={estilos.boton} onClick={() => alternar(i)}>
                  Ocultar
                </button>
              </>
            ) : (
              <button type="button" className={estilos.boton} onClick={() => alternar(i)}>
                Ver respuesta
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
