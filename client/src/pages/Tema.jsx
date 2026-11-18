import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { TeoriaTema } from "../components/TeoriaTema.jsx";
import { ContenidoPestanas, Pestanas } from "../components/Pestanas.jsx";
import { Insignia } from "../components/Insignia.jsx";
import { Quiz } from "../components/Quiz.jsx";
import { PreguntaAncla } from "../components/PreguntaAncla.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import estilos from "./Tema.module.css";

const NOMBRE_AREA = { javascript: "JavaScript", react: "React", typescript: "TypeScript", node: "Node.js y SQL" };

export function Tema() {
  const { id } = useParams();
  const [tema, setTema] = useState(() => api.tema.guardado(id));
  const [error, setError] = useState(null);
  const [pestana, setPestana] = usePestanaUrl(["teoria", "ejercicios", "quiz"]);

  useEffect(() => {
    setTema(null);
    setPestana("teoria");
    api.tema(id).then(setTema, (e) => setError(e.message));
  }, [id]);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!tema) return <Esqueleto variante="texto" />;

  async function terminarQuiz(aciertos) {
    const quiz = await api.guardarQuiz(tema.id, aciertos);
    setTema((t) => ({ ...t, quiz: t.quiz, resultadoQuiz: quiz }));
  }

  const mejor = tema.resultadoQuiz?.mejor ?? tema.quiz?.mejor;

  return (
    <article className={estilos.pagina} data-area={tema.area} data-pestana={pestana}>
      <Link to={`/aprender?area=${tema.area}`} className={estilos.volver}>
        <IconoFlechaIzq /> Aprender
      </Link>
      <header className={estilos.cabecera}>
        <span className={estilos.numeroGrande} aria-hidden>
          {String(tema.orden).padStart(2, "0")}
        </span>
        <div>
          <span className={estilos.numero}>
            {NOMBRE_AREA[tema.area] ?? "JavaScript"} · Tema {String(tema.orden).padStart(2, "0")}
          </span>
          <h1>{tema.titulo}</h1>
          <p>{tema.descripcion}</p>
        </div>
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

      <ContenidoPestanas activa={pestana} orden={["teoria", "ejercicios", "quiz"]} className={estilos.contenido}>
        {pestana === "teoria" && (
          <>
            <TeoriaTema id={tema.id} markdown={tema.teoria} />
            <PreguntaAncla key={tema.id} preguntas={tema.quiz} alSeguir={() => setPestana("ejercicios")} />
          </>
        )}

        {pestana === "ejercicios" && (
          <div className={estilos.ejercicios}>
            <p className={estilos.intro}>
              Hazlos en orden: van de más fácil a más difícil. Cuando los termines, comprueba lo aprendido con el quiz.
            </p>
            <ol className={estilos.pasos}>
              {tema.ejercicios.map((ej, i) => (
                <li key={ej.id} data-estado={ej.estado} data-hecho={ej.resuelto ? "solo" : ej.conAyuda ? "ayuda" : undefined}>
                  <span className={estilos.paso} title={ej.conAyuda ? "Lo hiciste viendo la solución" : undefined}>
                    {ej.resuelto || ej.conAyuda ? "✓" : i + 1}
                  </span>
                  <Link to={`/practicar/${ej.id}`} className={estilos.ejercicio}>
                    <span>{ej.titulo}</span>
                    <Insignia nivel={ej.nivel} />
                    <Insignia estado={ej.estado} />
                  </Link>
                </li>
              ))}
            </ol>
            {tema.ejercicios.some((ej) => ej.conAyuda) && (
              <p className={estilos.notaAyuda}>
                Los marcados en ámbar los hiciste viendo la solución: no cuentan como resueltos todavía. Vuelven en tu repaso (desde mañana)
                y, si los resuelves sin mirarla, se ponen en verde.
              </p>
            )}
          </div>
        )}

        {pestana === "quiz" && <Quiz key={tema.id} preguntas={tema.quiz} alTerminar={terminarQuiz} mejor={mejor} />}
      </ContenidoPestanas>

      <nav className={estilos.navegacion}>
        {tema.anterior ? (
          <Link to={`/aprender/${tema.anterior.id}`} className={estilos.vecino}>
            <small>← Anterior</small>
            {tema.anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {tema.siguiente && (
          <Link to={`/aprender/${tema.siguiente.id}`} className={estilos.vecino} data-lado="siguiente">
            <small>Siguiente →</small>
            {tema.siguiente.titulo}
          </Link>
        )}
      </nav>
    </article>
  );
}
