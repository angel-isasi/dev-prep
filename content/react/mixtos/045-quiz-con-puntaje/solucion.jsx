import { useState } from "react";

export function Quiz({ preguntas }) {
  // El único estado: lo que el usuario respondió, en orden.
  const [respuestas, setRespuestas] = useState([]);

  // Todo lo demás se deriva de las respuestas.
  const actual = respuestas.length;
  const terminado = actual === preguntas.length;
  const puntaje = respuestas.filter((respuesta, i) => respuesta === preguntas[i].correcta).length;

  if (terminado) {
    return (
      <div>
        <p>
          Acertaste {puntaje} de {preguntas.length}
        </p>
        <button onClick={() => setRespuestas([])}>Jugar de nuevo</button>
      </div>
    );
  }

  const pregunta = preguntas[actual];

  return (
    <div>
      <p>
        Pregunta {actual + 1} de {preguntas.length}
      </p>
      <h2>{pregunta.texto}</h2>
      {pregunta.opciones.map((opcion) => (
        <button key={opcion} onClick={() => setRespuestas((anteriores) => [...anteriores, opcion])}>
          {opcion}
        </button>
      ))}
    </div>
  );
}
