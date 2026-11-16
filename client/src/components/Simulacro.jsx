import { useState } from "react";
import { api } from "../lib/api.js";
import { ES_MOVIL } from "../lib/modo.js";
import { Tarjeta } from "./Tarjeta.jsx";
import { Cronometro, mmss } from "./Cronometro.jsx";
import estilos from "./Simulacro.module.css";

const DURACION = 30 * 60; // 30 minutos

const alAzar = (lista, n) => [...lista].sort(() => Math.random() - 0.5).slice(0, n);

/**
 * Simulacro de entrevista: 3 preguntas técnicas, 1 ejercicio y 1 pregunta personal,
 * con 30 minutos en total.
 */
export function Simulacro() {
  const [estado, setEstado] = useState("inicio"); // inicio | curso | fin
  const [pasos, setPasos] = useState([]);
  const [paso, setPaso] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [fin, setFin] = useState(0);

  async function empezar() {
    const [tarjetas, ejercicios] = await Promise.all([api.tarjetas({}), api.ejerciciosEntrevista()]);
    const tecnicas = alAzar(
      tarjetas.filter((t) => !t.personal),
      3,
    );
    const personal = alAzar(
      tarjetas.filter((t) => t.personal),
      1,
    );
    const sinResolver = ejercicios.filter((e) => e.estado !== "resuelto");
    const ejercicio = alAzar(sinResolver.length ? sinResolver : ejercicios, 1)[0];
    const lista = [
      ...tecnicas.slice(0, 2).map((p) => ({ tipo: "pregunta", p })),
      ejercicio && { tipo: "ejercicio", ej: ejercicio },
      ...tecnicas.slice(2).map((p) => ({ tipo: "pregunta", p })),
      ...personal.map((p) => ({ tipo: "pregunta", p })),
    ].filter(Boolean);
    setPasos(lista);
    setPaso(0);
    setResultados([]);
    setInicio(Date.now());
    setEstado("curso");
  }

  function avanzar(resultado) {
    const nuevos = [...resultados, resultado];
    setResultados(nuevos);
    if (paso + 1 >= pasos.length) {
      setFin(Date.now());
      setEstado("fin");
    } else {
      setPaso(paso + 1);
    }
  }

  async function calificar(nota) {
    await api.calificar(pasos[paso].p.id, nota);
    avanzar(nota);
  }

  if (estado === "inicio") {
    return (
      <div className={estilos.panel}>
        <h2>Simulacro de entrevista</h2>
        <p>
          Una sesión de <strong>30 minutos</strong> como una entrevista técnica real: 3 preguntas teóricas, un
          ejercicio para programar y una pregunta personal. Responde todo en voz alta, sin pausar.
        </p>
        <ul>
          <li>Ponte en un lugar tranquilo, como si fuera la entrevista de verdad.</li>
          <li>En el ejercicio, piensa en voz alta: entender, ejemplos, plan, código, probar.</li>
          <li>Al final verás cuánto tiempo usaste y cómo te fue.</li>
        </ul>
        <button type="button" className="boton boton-primario" onClick={empezar}>
          Empezar simulacro
        </button>
      </div>
    );
  }

  if (estado === "fin") {
    const usados = Math.round((fin - inicio) / 1000);
    const textos = { sabia: "Lo sabía", dude: "Dudé", no: "No lo sabía", hecho: "Lo resolví", "no-llegue": "No llegué" };
    return (
      <div className={estilos.panel}>
        <h2>Simulacro terminado</h2>
        <p>
          Tiempo usado: <strong>{mmss(usados)}</strong> de 30:00
          {usados > DURACION && " (te pasaste del tiempo)"}
        </p>
        <ol className={estilos.resumen}>
          {pasos.map((p, i) => (
            <li key={i}>
              <span>{p.tipo === "ejercicio" ? `Ejercicio: ${p.ej.titulo}` : p.p.pregunta.replaceAll("`", "")}</span>
              <strong data-ok={["sabia", "hecho"].includes(resultados[i])}>{textos[resultados[i]]}</strong>
            </li>
          ))}
        </ol>
        <p className={estilos.nota}>
          Las preguntas que no sabías ya quedaron en tu repaso de tarjetas. Si no llegaste con el ejercicio, vuelve a
          él en Practicar.
        </p>
        <button type="button" className="boton boton-primario" onClick={() => setEstado("inicio")}>
          Hacer otro
        </button>
      </div>
    );
  }

  const actual = pasos[paso];
  return (
    <div className={estilos.curso}>
      <div className={estilos.barraSuperior}>
        <span>
          Paso {paso + 1} de {pasos.length}
        </span>
        <Cronometro inicio={inicio} segundos={DURACION} />
      </div>

      {actual.tipo === "pregunta" ? (
        <Tarjeta key={actual.p.id} pregunta={actual.p} alCalificar={calificar} />
      ) : (
        <div className={estilos.panel}>
          <span className={estilos.etiqueta}>Ejercicio en vivo</span>
          <h2>{actual.ej.titulo}</h2>
          <p>
            Ábrelo en una pestaña nueva y resuélvelo en VS Code mientras explicas en voz alta. Cuando termines (o se te
            acabe el tiempo que le darías en una entrevista, unos 15 minutos), vuelve aquí.
          </p>
          <div className={estilos.acciones}>
            <a className="boton boton-primario" href={`/practicar/${actual.ej.id}`} target={ES_MOVIL ? undefined : "_blank"} rel="noreferrer">
              Abrir el ejercicio
            </a>
            <button type="button" className="boton" onClick={() => avanzar("hecho")}>
              Lo resolví
            </button>
            <button type="button" className="boton boton-fantasma" onClick={() => avanzar("no-llegue")}>
              No llegué
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
