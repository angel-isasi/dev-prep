// La página de un tema: todo lo de ese tema en un solo lugar. Antes había que ir a Aprender
// (teoría y quiz), Lecciones, Chuletas, Referencia y Glosario, más los ejercicios en Practicar y
// las preguntas en Entrevistas. Ahora cada cosa es una pestaña de esta página, y arriba se ve
// cuánto dominas el tema y qué te falta para ponerlo en verde.
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { TeoriaTema } from "../components/TeoriaTema.jsx";
import { ContenidoPestanas, Pestanas } from "../components/Pestanas.jsx";
import { Quiz } from "../components/Quiz.jsx";
import { AprenderIa, QuizFallos } from "../components/ia/AprenderIa.jsx";
import { PreguntaAncla } from "../components/PreguntaAncla.jsx";
import { PreguntasEntrevista } from "../components/PreguntasEntrevista.jsx";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { Grupo } from "../movil/leccion/RutaLecciones.jsx";
import estilos from "./Tema.module.css";

const NOMBRE_AREA = { javascript: "JavaScript", algoritmos: "Algoritmos", react: "React", typescript: "TypeScript", node: "Node.js y SQL" };
const ESTADO = { verde: "Lo dominas", amarillo: "A medias", rojo: "Flojo", "sin-empezar": "Sin empezar" };
const TONO = { verde: "exito", amarillo: "aviso", rojo: "error", "sin-empezar": undefined };
// En la lista de ejercicios el nivel es un punto de color y el estado un icono: así el título no se
// parte en varias líneas por culpa de dos etiquetas. El texto queda en el title (y para lectores de pantalla).
const NIVEL = { 1: "Básico", 2: "Intermedio", 3: "Difícil" };
const ESTADO_EJERCICIO = {
  resuelto: { icono: "✓", texto: "Resuelto" },
  "en-progreso": { icono: "◐", texto: "En progreso" },
  repasar: { icono: "↻", texto: "Para repasar" },
  estudiado: { icono: "✓", texto: "Estudiado" },
};

/** Título de un ejercicio con su nivel (punto de color) y su estado (icono; pendiente no lleva nada). */
function FilaEjercicio({ ej }) {
  const estado = ESTADO_EJERCICIO[ej.estado];
  return (
    <>
      <span className={estilos.puntoNivel} data-nivel={ej.nivel} role="img" aria-label={`Nivel: ${NIVEL[ej.nivel] ?? ej.nivel}`} title={NIVEL[ej.nivel]} />
      <span className={estilos.tituloEjercicio}>{ej.titulo}</span>
      {estado && (
        <span className={estilos.iconoEstado} data-estado={ej.estado} role="img" aria-label={estado.texto} title={estado.texto}>
          {estado.icono}
        </span>
      )}
    </>
  );
}

export function Tema() {
  const { id } = useParams();
  const [tema, setTema] = useState(() => api.tema.guardado(id));
  const [centro, setCentro] = useState(null);
  const [error, setError] = useState(null);
  const [pestana, setPestana] = usePestanaUrl(["teoria", "lecciones", "ejercicios", "quiz", "entrevista"]);
  const anterior = useRef(id);

  const cargarCentro = () => api.centroDelTema?.(id).then(setCentro, () => {});

  useEffect(() => {
    // Al pasar a otro tema se vuelve a la teoría; al entrar por un enlace, se respeta su pestaña
    if (anterior.current !== id) {
      anterior.current = id;
      setPestana("teoria");
    }
    let cancelado = false;
    setTema(api.tema.guardado(id));
    setCentro(null);
    setError(null);
    api.tema(id).then(
      (t) => !cancelado && setTema(t),
      (e) => !cancelado && setError(e.message),
    );
    api.centroDelTema?.(id).then((c) => !cancelado && setCentro(c), () => {});
    return () => {
      cancelado = true;
    };
  }, [id]);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!tema) return <Esqueleto variante="texto" />;

  async function terminarQuiz(aciertos) {
    const quiz = await api.guardarQuiz(tema.id, aciertos);
    setTema((t) => ({ ...t, quiz: t.quiz, resultadoQuiz: quiz }));
    cargarCentro();
  }

  const mejor = tema.resultadoQuiz?.mejor ?? tema.quiz?.mejor;
  const dominio = centro?.dominio;
  const plan = centro?.plan;
  const paraEntrevista = centro ? centro.terminos.length + centro.metodos.length + centro.preguntas.length : 0;

  // Las pestañas de lecciones y de entrevista solo existen en la versión web
  const pestanas = [
    { id: "teoria", texto: "Teoría" },
    plan?.total ? { id: "lecciones", texto: "Lecciones", extra: `${plan.hechas}/${plan.total}` } : null,
    { id: "ejercicios", texto: "Ejercicios", extra: `${tema.resueltos}/${tema.totalEjercicios}` },
    { id: "quiz", texto: "Quiz", extra: mejor != null ? `${mejor}/${tema.preguntasQuiz}` : undefined },
    paraEntrevista ? { id: "entrevista", texto: "Para la entrevista", extra: String(paraEntrevista) } : null,
  ].filter(Boolean);
  const activa = pestanas.some((p) => p.id === pestana) ? pestana : "teoria";

  return (
    <article className={estilos.pagina} data-area={tema.area} data-pestana={activa}>
      <Link to={`/aprender?area=${tema.area}`} viewTransition className={estilos.volver}>
        <IconoFlechaIzq /> Aprender
      </Link>
      <header className={estilos.cabecera}>
        <span className={estilos.numeroGrande} aria-hidden>
          {String(tema.orden).padStart(2, "0")}
        </span>
        <div className={estilos.titulo}>
          <span className={estilos.numero}>
            {NOMBRE_AREA[tema.area] ?? "JavaScript"} · Tema {String(tema.orden).padStart(2, "0")}
          </span>
          {/* Comparte nombre con el título de la tarjeta de Aprender: el navegador anima el paso de uno a otro */}
          <h1 style={{ viewTransitionName: "titulo-tema" }}>{tema.titulo}</h1>
          {/* La descripción repite el índice "Lo esencial": solo acompaña a la teoría */}
          {activa === "teoria" && <p>{tema.descripcion}</p>}
        </div>

        {/* Cuánto dominas este tema y qué te falta (el mismo cálculo del mapa de Progreso) */}
        {dominio && (
          <aside className={estilos.dominio}>
            <AnilloProgreso valor={dominio.valor} tamano={72} grosor={7} completo={dominio.estado === "verde"}>
              <strong className={estilos.porcentaje}>{Math.round(dominio.valor * 100)}%</strong>
            </AnilloProgreso>
            <div>
              <span className="chip" data-tono={TONO[dominio.estado]}>
                {ESTADO[dominio.estado]}
              </span>
              {dominio.falta.length > 0 ? (
                <ul className={estilos.falta}>
                  {dominio.falta.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className={estilos.falta}>No te falta nada: solo mantenerlo con los repasos.</p>
              )}
            </div>
          </aside>
        )}
      </header>

      <Pestanas pestanas={pestanas} activa={activa} alCambiar={setPestana} />

      <ContenidoPestanas activa={activa} orden={pestanas.map((p) => p.id)} className={estilos.contenido}>
        {activa === "teoria" && (
          <>
            <TeoriaTema id={tema.id} markdown={tema.teoria} />
            <AprenderIa tema={tema.titulo} teoria={tema.teoria} />
            <PreguntaAncla key={tema.id} preguntas={tema.quiz} alSeguir={() => setPestana(plan?.total ? "lecciones" : "ejercicios")} />
          </>
        )}

        {activa === "lecciones" && plan && (
          <div className={estilos.lecciones}>
            <div className={estilos.acciones}>
              {plan.siguiente ? (
                <Link
                  to={`/leccion?unidad=${encodeURIComponent(tema.id)}&parte=${plan.siguiente.id}`}
                  className="boton boton-primario"
                  onClick={() => api.elegirUnidad(tema.id)}
                >
                  {plan.hechas ? "Siguiente" : "Empezar"}: {plan.siguiente.nombre} →
                </Link>
              ) : (
                <span className="chip" data-tono="exito">
                  Todas las lecciones hechas
                </span>
              )}
              <Link to={`/leccion?unidad=${encodeURIComponent(tema.id)}&modo=prueba`} className="boton">
                Prueba de la unidad{centro.prueba ? ` · tu mejor: ${centro.prueba.mejor}/${centro.prueba.total}` : ""}
              </Link>
              <span className={estilos.nota}>
                {plan.preguntas.aprendidos} de {plan.preguntas.total} preguntas aprendidas · {plan.preguntas.fijados} fijadas
              </span>
            </div>
            <div className={estilos.grupos}>
              {plan.grupos.map((g) => (
                <Grupo key={g.id} grupo={g} unidad={tema.id} />
              ))}
            </div>
          </div>
        )}

        {activa === "ejercicios" && (
          <div className={estilos.ejercicios}>
            <ol className={estilos.pasos}>
              {tema.ejercicios.map((ej, i) => (
                <li key={ej.id} data-estado={ej.estado} data-hecho={ej.resuelto ? "solo" : ej.conAyuda ? "ayuda" : undefined}>
                  <span className={estilos.paso} title={ej.conAyuda ? "Lo hiciste viendo la solución" : undefined}>
                    {ej.resuelto || ej.conAyuda ? "✓" : i + 1}
                  </span>
                  <Link to={`/practicar/${ej.id}`} className={estilos.ejercicio}>
                    <FilaEjercicio ej={ej} />
                  </Link>
                </li>
              ))}
            </ol>
            {tema.ejercicios.some((ej) => ej.conAyuda) && (
              <p className={estilos.notaAyuda}>En ámbar: los hiciste viendo la solución. Vuelven en tu repaso y, sin mirarla, pasan a verde.</p>
            )}

            {/* Los demás ejercicios de Practicar que son de este tema */}
            {centro?.otrosEjercicios.length > 0 && (
              <>
                <h2 className={estilos.subtitulo}>
                  Más práctica de este tema <small>{centro.otrosEjercicios.length} ejercicios de Practicar</small>
                </h2>
                <div className={estilos.rejilla}>
                  {centro.otrosEjercicios.map((ej) => (
                    <Link key={ej.id} to={`/practicar/${ej.id}`} className={`brillo ${estilos.ejercicio}`}>
                      <FilaEjercicio ej={ej} />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activa === "quiz" && <Quiz key={tema.id} preguntas={tema.quiz} alTerminar={terminarQuiz} mejor={mejor} extraFinal={(fallos) => <QuizFallos tema={tema.titulo} fallos={fallos} />} />}

        {activa === "entrevista" && centro && (
          <div className={estilos.entrevista}>
            {centro.preguntas.length > 0 && (
              <section>
                <h2 className={estilos.subtitulo}>
                  Preguntas que te pueden hacer <small>de Entrevistas</small>
                </h2>
                <PreguntasEntrevista preguntas={centro.preguntas.map((p) => ({ titulo: p.pregunta, cuerpo: p.respuesta }))} />
              </section>
            )}

            <div className={estilos.dosColumnas}>
              {centro.terminos.length > 0 && (
                <section>
                  <h2 className={estilos.subtitulo}>
                    Términos <small>del Glosario</small>
                  </h2>
                  <dl className={estilos.terminos}>
                    {centro.terminos.map((t) => (
                      <div key={t.id}>
                        <dt>
                          {t.termino}
                          {t.en && t.en.toLowerCase() !== t.termino.toLowerCase() && <small> · {t.en}</small>}
                        </dt>
                        <dd>{t.definicion}</dd>
                        {t.entrevista && (
                          <dd className={estilos.frase}>
                            <span className={estilos.chipEntrevista}>En la entrevista</span> {t.entrevista}
                          </dd>
                        )}
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {centro.metodos.length > 0 && (
                <section>
                  <h2 className={estilos.subtitulo}>
                    Métodos <small>de la Referencia</small>
                  </h2>
                  <ul className={estilos.metodos}>
                    {centro.metodos.map((m) => (
                      <li key={m.id}>
                        <Link to={`/referencia?q=${encodeURIComponent(m.nombre)}`}>
                          <code>{m.nombre}</code>
                          <span>{m.descripcion}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        )}
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
