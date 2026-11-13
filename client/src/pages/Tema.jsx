import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { Markdown } from "../components/Markdown.jsx";
import { Pestanas } from "../components/Pestanas.jsx";
import { Insignia } from "../components/Insignia.jsx";
import { Quiz } from "../components/Quiz.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
import estilos from "./Tema.module.css";

export function Tema() {
  const { id } = useParams();
  const [tema, setTema] = useState(null);
  const [error, setError] = useState(null);
  const [pestana, setPestana] = useState("teoria");

  useEffect(() => {
    setTema(null);
    setPestana("teoria");
    api.tema(id).then(setTema, (e) => setError(e.message));
  }, [id]);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!tema) return <p className={estilos.mensaje}>Cargando…</p>;

  async function terminarQuiz(aciertos) {
    const quiz = await api.guardarQuiz(tema.id, aciertos);
    setTema((t) => ({ ...t, quiz: t.quiz, resultadoQuiz: quiz }));
  }

  const mejor = tema.resultadoQuiz?.mejor ?? tema.quiz?.mejor;

  return (
    <article className={estilos.pagina}>
      <Link to="/aprender" className={estilos.volver}>
        <IconoFlechaIzq /> Aprender
      </Link>
      <header className={estilos.cabecera}>
        <span className={estilos.numero}>Tema {String(tema.orden).padStart(2, "0")}</span>
        <h1>{tema.titulo}</h1>
        <p>{tema.descripcion}</p>
      </header>

      <Pestanas
        pestanas={[
          { id: "teoria", texto: "Teoría" },
          { id: "ejercicios", texto: "Ejercicios", extra: `${tema.resueltos}/${tema.totalEjercicios}` },
          { id: "quiz", texto: "Quiz", extra: mejor != null ? `${mejor}/${tema.preguntasQuiz}` : undefined },
        ]}
        activa={pestana}
        alCambiar={setPestana}
      />

      <div className={estilos.contenido}>
        {pestana === "teoria" && (
          <>
            <Markdown>{tema.teoria}</Markdown>
            <div className={estilos.seguir}>
              <button type="button" className="boton boton-primario" onClick={() => setPestana("ejercicios")}>
                Practicar con los ejercicios →
              </button>
            </div>
          </>
        )}

        {pestana === "ejercicios" && (
          <div className={estilos.ejercicios}>
            <p className={estilos.intro}>
              Hazlos en orden: van de más fácil a más difícil. Cuando los termines, comprueba lo aprendido con el quiz.
            </p>
            <ol>
              {tema.ejercicios.map((ej) => (
                <li key={ej.id}>
                  <Link to={`/practicar/${ej.id}`} className={estilos.ejercicio}>
                    <span>{ej.titulo}</span>
                    <Insignia nivel={ej.nivel} />
                    <Insignia estado={ej.estado} />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        {pestana === "quiz" && <Quiz key={tema.id} preguntas={tema.quiz} alTerminar={terminarQuiz} mejor={mejor} />}
      </div>

      <nav className={estilos.navegacion}>
        {tema.anterior ? <Link to={`/aprender/${tema.anterior.id}`}>← {tema.anterior.titulo}</Link> : <span />}
        {tema.siguiente && <Link to={`/aprender/${tema.siguiente.id}`}>{tema.siguiente.titulo} →</Link>}
      </nav>
    </article>
  );
}
